# Official URL Validation

Checked 2026-07-16 with redirects enabled and a 20-second timeout. These transport results are diagnostic only: bot protection, TLS negotiation and transient timeouts do not invalidate an official domain. Detailed profile pages were also inspected through a browser-capable reader during research.

| Institution | Tested official URL | HTTP | Final URL / result |
| --- | --- | ---: | --- |
| CGCC | `https://www.cgcc.com.kh/en/` | 403 | same URL; bot protection, About page remained browser-accessible |
| CGTMSE | `https://www.cgtmse.in/` | 000 | timeout; official About page remained browser-accessible |
| ASIPPINDO | `https://asippindo.or.id/` | 200 | same URL |
| ASKRINDO | `https://askrindo.co.id/` | 200 | same URL; profile path remained temporarily unavailable |
| JFC | `https://www.jfc.go.jp/n/english/` | 200 | same URL |
| JFG | `https://www.zenshinhoren.or.jp/english/` | 200 | same URL |
| KODIT | `https://www.kodit.or.kr/koditEng/main.do` | 200 | same URL |
| KOREG | `https://www.koreg.or.kr/` | 200 | same URL |
| KOTEC | `https://www.kibo.or.kr/english/` | 200 | redirected to `https://www.kibo.or.kr/english/work/work010100.do` |
| OJSCGF | `https://gf.kg/en/` | 403 | same URL; official English page remained browser-accessible |
| CGC | `https://www.cgc.com.my/en-us/` | 403 | same URL; official Overview remained browser-accessible |
| CGFM | `https://www.cgf.mn/` | 200 | same URL |
| DCGF | `https://dcgf.gov.np/` | 200 | same URL |
| SMEC | `https://smecorp.gov.pg/` | 200 | same URL |
| CGCPNG | `https://www.cgc.com.pg/` | 000 | timeout; official homepage remained browser-accessible |
| PHILGUARANTEE | `https://www.philguarantee.gov.ph/` | 200 | same URL |
| CBSL | `https://www.cbsl.gov.lk/` | 200 | same URL |
| SLECIC | `https://www.slecic.lk/web/index.php/en/` | 404 | English root path; specific official `who-we-are` page returned content |
| TSMEG | `https://www.smeg.org.tw/en/` | 403 | same URL; member/profile pages remained browser-accessible |
| TCG | `https://www.tcg.or.th/en/aboutus.php` | 200 | same URL |
| ACGF | `https://www.acgf.org.tw/` | 200 | same URL |

No official URL was replaced with a non-official mirror. Temporary transport errors are retained as research-quality warnings.

