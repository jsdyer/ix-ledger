"""Reduce a dated CAIDA PeeringDB archive to the reported Canadian exchange presence."""
import argparse
import json
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from urllib.request import Request, urlopen

DATA = Path(__file__).resolve().parents[1] / "web/data"
BASE = "https://data.caida.org/datasets/peeringdb-v2"

def edition_url(day):
    return f"{BASE}/{day:%Y/%m}/peeringdb_2_dump_{day:%Y_%m_%d}.json"

def reduce_edition(dump):
    def rows(key):
        return [x for x in dump[key]["data"] if x.get("status") == "ok"]
    exchanges = {x["id"]: {"id": x["id"], "name": x["name"], "city": x.get("city", ""), "members": {}}
                 for x in rows("ix") if x["country"] == "CA"}
    lans = {x["id"]: x["ix_id"] for x in rows("ixlan")}
    names = {x["asn"]: x["name"] for x in rows("net")}
    for r in rows("netixlan"):
        ix = exchanges.get(lans.get(r["ixlan_id"]))
        if not ix or r.get("operational") is False:
            continue
        asn = r["asn"]
        # Two listed interfaces can belong to one ASN and to different port speeds.
        m = ix["members"].setdefault(asn, [asn, names.get(asn, f"AS{asn}"), 0, 0, 0])
        m[2] += 1
        if (r.get("speed") or 0) > 0:
            m[3] += r["speed"]
        else:
            m[4] += 1
    for x in exchanges.values():
        x["members"] = sorted(x["members"].values())
    if len(exchanges) < 10 or sum(len(x["members"]) for x in exchanges.values()) < 200:
        raise ValueError("Source snapshot has unexpectedly few Canadian exchange records")
    return sorted(exchanges.values(), key=lambda x: x["name"].casefold())

def compact(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n")

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--date", type=date.fromisoformat)
    p.add_argument("--file", type=Path)
    args = p.parse_args()
    now = datetime.now(timezone.utc).date()
    day = args.date or now - timedelta(days=2)
    if args.file:
        dump = json.loads(args.file.read_bytes())
    else:
        with urlopen(Request(edition_url(day), headers={"User-Agent": "CoolCode exchange ledger"}), timeout=150) as r:
            dump = json.load(r)
    exchanges = reduce_edition(dump)
    DATA.mkdir(parents=True, exist_ok=True)
    compact(DATA / (str(day) + ".json"), exchanges)
    dates = sorted(q.stem for q in DATA.glob("????-??-??.json"))
    last = json.loads((DATA / (dates[-1]+".json")).read_text())
    compact(DATA / "status.json", {"dates": dates, "start": dates[0], "end": dates[-1], "retrieved": str(now),
                                    "exchanges": len(last),"memberships": sum(len(x["members"]) for x in last)})

if __name__ == "__main__":
    main()
