# IX Ledger

[Compare Canadian exchanges](https://coolcode.ca/ix-ledger/)

Choose an exchange and a pair of dated PeeringDB snapshots. See unique member ASNs, reported operational interface capacity, and additions, removals and changes. The table can show networks present at the selected exchange and absent from another one on the later date. Filters have shareable URLs and CSV downloads.

<!-- coolcode:guide -->
VANIX had 48 listed ASNs in the November 1, 2018 snapshot and 79 on November 18, 2026. Compare the two editions, then choose Appeared to inspect the individual networks behind the change.
<!-- /coolcode:guide -->

The launch has seven archive editions between 2018 and 2026. The November 18 edition has 28 Canadian exchanges and 931 distinct ASN/exchange pairs. Dates between the stored editions have no observation here. An exchange missing entirely from one edition receives an unknown baseline. A recorded exchange with zero listed networks can legitimately have zero members.

The collector joins each netixlan record to its exchange LAN and exchange, limiting the result to Canadian exchange records. It ignores deleted records and interfaces explicitly marked nonoperational, groups multiple interfaces by ASN and sums their disclosed positive speeds in decimal Mbps before showing Gbps. Counts describe self-reported directory presence. Unknown interface speeds remain visible. A different ASN can represent a related organization. A listing alone cannot establish bilateral peering, traffic volume or the location of an individual member’s traffic.

Data are derived from PeeringDB, via [CAIDA’s PeeringDB archive](https://www.caida.org/catalog/datasets/peeringdb/) and its [dated downloads](https://data.caida.org/datasets/peeringdb-v2/). Every comparison links its two source files and live exchange record. The weekly workflow records one additional edition. Run `python scripts/refresh.py --date YYYY-MM-DD` to add a specific day. A failed import leaves the existing live site in place.

Use `node --test tests/*.test.mjs`, `python -m unittest discover -s tests` and `python scripts/build.py` for local checks and an offline site build.
