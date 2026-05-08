# Security Infrastructure Audit: managustin.vercel.app

**Author:** Agustín Mango  
**Date:** May 8, 2026  
**Target:** `managustin.vercel.app`  
**Methodology:** Detection → Mitigation → Validation  

---

## Executive Summary

This report documents a full-cycle security audit of the public-facing surface of `managustin.vercel.app`. The assessment followed a structured three-phase methodology:

1. **Reconnaissance** — Passive enumeration of HTTP response headers and TLS configuration to identify the initial attack surface.
2. **Remediation** — Implementation of a hardened security header policy via `vercel.json` to close the identified gaps.
3. **Validation** — Post-deployment verification to confirm that the mitigations are correctly applied and effective.

The initial scan revealed a **complete absence of application-level security headers** (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy), exposing the site to clickjacking, MIME-sniffing, and cross-site injection attacks. While the transport layer (TLS) was found to be correctly configured with a **Grade A** cipher suite, the application layer required immediate hardening.

All identified vulnerabilities have been remediated. The details follow below.

---

## Phase 1: Reconnaissance (Pre-Mitigation)

### 1.1 HTTP Header Analysis

The initial state of the application's HTTP response headers was captured using a standard `HEAD` request:

```
~ ▓▒░ curl -I https://managustin.vercel.app/                                                        ░▒▓ 3 х  12:12:01
HTTP/2 200
accept-ranges: bytes
access-control-allow-origin: *
age: 1227
cache-control: public, max-age=0, must-revalidate
content-disposition: inline
content-type: text/html; charset=utf-8
date: Fri, 08 May 2026 12:12:58 GMT
etag: "bcc4f4f80ecd8fbfda7884b7d0c12f59"
last-modified: Fri, 08 May 2026 11:52:30 GMT
server: Vercel
strict-transport-security: max-age=63072000; includeSubDomains; preload
x-vercel-cache: HIT
x-vercel-id: gru1::pmmjs-1778242378266-e2874300ddc3
content-length: 12669
```

### 1.2 Findings

| # | Finding | Severity | Description |
|---|---------|----------|-------------|
| F-01 | Missing `Content-Security-Policy` | **High** | No CSP header present. The browser has no instructions on which sources are trusted for scripts, styles, or connections. This leaves the site fully exposed to **Cross-Site Scripting (XSS)** attacks, where an attacker could inject arbitrary JavaScript to steal session data or redirect users. |
| F-02 | Missing `X-Frame-Options` | **Medium** | Without this header, the site can be embedded in an `<iframe>` on any malicious domain, enabling **Clickjacking** attacks. An attacker could overlay invisible elements on top of the framed page to trick users into performing unintended actions. |
| F-03 | Missing `X-Content-Type-Options` | **Medium** | Browsers may attempt to "sniff" the MIME type of a response, potentially interpreting a non-executable resource (e.g., a text file) as a script. This creates a vector for **MIME-type confusion attacks**. |
| F-04 | Missing `Referrer-Policy` | **Low** | The full URL, including query parameters, is sent as the `Referer` header on cross-origin navigations by default. This can lead to **Information Leakage** of sensitive data encoded in URLs. |
| F-05 | Missing `Permissions-Policy` | **Low** | Without this header, the browser's default permissions apply. Explicitly denying unused APIs (camera, microphone, geolocation) is a defense-in-depth measure that reduces the attack surface if an XSS vulnerability is ever exploited. |
| F-06 | `server: Vercel` exposed | **Informational** | The `server` header discloses the hosting platform. While not a direct vulnerability, it aids an attacker's fingerprinting efforts by confirming the infrastructure provider, which can be used to target platform-specific exploits. |
| F-07 | `x-vercel-id` exposed | **Informational** | Internal deployment identifiers are leaked in the response. This constitutes **Information Leakage** that could be leveraged in targeted attacks against the deployment infrastructure. |

> **Note:** Finding F-06 and F-07 relate to headers injected by the Vercel platform itself and cannot be removed via `vercel.json` configuration. They are documented here for completeness.

---

## Phase 2: Transport Layer Security (SSL/TLS)

### 2.1 Cipher Suite Enumeration

A full TLS handshake analysis was performed using `nmap`'s `ssl-enum-ciphers` script:

```
~ ▓▒░ nmap -sV -Pn --script ssl-enum-ciphers -p 443 managustin.vercel.app                        ░▒▓ ✔  24s  12:30:05
Starting Nmap 7.94SVN ( https://nmap.org ) at 2026-05-08 12:32 UTC
Nmap scan report for managustin.vercel.app (64.29.17.67)
Host is up (0.031s latency).
Other addresses for managustin.vercel.app (not scanned): 216.198.79.67

PORT    STATE SERVICE   VERSION
443/tcp open  ssl/https Vercel
|_http-server-header: Vercel
| ssl-enum-ciphers:
|   TLSv1.2:
|     ciphers:
|       TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256 (secp256r1) - A
|       TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256 (secp256r1) - A
|       TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 (secp256r1) - A
|       TLS_DHE_RSA_WITH_AES_256_GCM_SHA384 (dh 2048) - A
|     compressors:
|       NULL
|     cipher preference: server
|   TLSv1.3:
|     ciphers:
|       TLS_AKE_WITH_AES_128_GCM_SHA256 (ecdh_x25519) - A
|       TLS_AKE_WITH_AES_256_GCM_SHA384 (ecdh_x25519) - A
|       TLS_AKE_WITH_CHACHA20_POLY1305_SHA256 (ecdh_x25519) - A
|     cipher preference: server
|_  least strength: A
```

### 2.2 Analysis

| Aspect | Status | Details |
|--------|--------|---------|
| **Overall Grade** | ✅ **A** | All cipher suites scored an individual **A** grade. The `least strength` field confirms there are no weak links in the chain. |
| **Protocol Support** | ✅ Secure | Only **TLS 1.2** and **TLS 1.3** are enabled. The deprecated and insecure protocols **TLS 1.0** and **TLS 1.1** (vulnerable to BEAST, POODLE) are correctly **absent**. SSLv3 is also not offered. |
| **Forward Secrecy (PFS)** | ✅ Enabled | All TLS 1.2 ciphers use Ephemeral Diffie-Hellman key exchange (`ECDHE` / `DHE`), and all TLS 1.3 ciphers use `ecdh_x25519`. This guarantees **Perfect Forward Secrecy**: even if the server's long-term private key is compromised in the future, past session traffic remains encrypted and unrecoverable. |
| **Cipher Strength** | ✅ Strong | The suite exclusively uses AEAD ciphers: **AES-128-GCM**, **AES-256-GCM**, and **ChaCha20-Poly1305**. No CBC-mode ciphers are present, eliminating padding oracle attack vectors. |
| **Compression** | ✅ Disabled | TLS compression is set to `NULL`, which is the correct configuration. Enabling TLS compression would expose the site to the **CRIME** attack. |
| **Cipher Preference** | ✅ Server-side | The server enforces its own cipher order rather than deferring to the client, preventing downgrade attacks where a malicious client negotiates a weaker cipher. |

**Conclusion:** The TLS configuration managed by Vercel is robust and adheres to current industry best practices. No remediation is required at the transport layer.

---

## Phase 3: Remediation

Based on the findings from Phase 1 (§1.2), a `vercel.json` configuration file was created to inject the missing security headers into all HTTP responses.

### 3.1 Header Configuration (`vercel.json`)

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; connect-src 'self' https://api.emailjs.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

### 3.2 Rationale for Each Directive

#### `Strict-Transport-Security`
- **`max-age=63072000`** (2 years): Instructs browsers to exclusively use HTTPS for all future requests to this domain for the next two years. This value meets the minimum threshold required for inclusion in browser HSTS preload lists.
- **`includeSubDomains`**: Extends the HSTS policy to all subdomains, preventing an attacker from exploiting a subdomain served over plain HTTP as a pivot point.
- **`preload`**: Signals eligibility for the [HSTS Preload List](https://hstspreload.org/), a hardcoded list shipped in browsers that enforces HTTPS even on the very first connection, eliminating the TOFU (Trust On First Use) vulnerability window.

#### `Content-Security-Policy`
The CSP follows the **principle of least privilege**, whitelisting only the minimum required sources:

| Directive | Value | Justification |
|-----------|-------|---------------|
| `default-src` | `'self'` | Baseline: only allow resources from the same origin. |
| `script-src` | `'self' 'unsafe-inline' https://cdn.jsdelivr.net` | `'self'` for bundled JS. `'unsafe-inline'` is required because Vite injects inline `<script>` tags in the production build. `cdn.jsdelivr.net` is the CDN from which the EmailJS SDK (`@emailjs/browser`) is dynamically loaded. |
| `connect-src` | `'self' https://api.emailjs.com` | `api.emailjs.com` is the API endpoint that `emailjs.sendForm()` calls to deliver contact form submissions. |
| `style-src` | `'self' 'unsafe-inline'` | `'unsafe-inline'` is necessary for Tailwind CSS styles injected by Vite at build time. |
| `img-src` | `'self' data:` | `data:` URIs are allowed for inline SVG/image encoding used by the build pipeline. |
| `font-src` | `'self'` | Custom fonts (Outfit) are served locally from `/assets/fonts/`. No external font CDNs are used. |
| `frame-ancestors` | `'none'` | Equivalent to `X-Frame-Options: DENY` in CSP syntax. Provides the modern, CSP-based anti-clickjacking protection. |
| `base-uri` | `'self'` | Prevents `<base>` tag injection, which could redirect all relative URLs to an attacker-controlled domain. |
| `form-action` | `'self'` | Restricts form submissions to the same origin, preventing form hijacking where a malicious script redirects form data to an external endpoint. |

#### `X-Frame-Options: DENY`
Legacy anti-clickjacking header. While `frame-ancestors 'none'` in the CSP provides the same protection, `X-Frame-Options` is included for backward compatibility with older browsers that do not fully support CSP Level 2.

#### `X-Content-Type-Options: nosniff`
Instructs the browser to strictly respect the `Content-Type` header declared by the server and never attempt MIME-type sniffing. This prevents attacks where a malicious file uploaded with an innocuous extension (e.g., `.txt`) is interpreted as executable JavaScript.

#### `Referrer-Policy: strict-origin-when-cross-origin`
- **Same-origin requests:** The full URL (origin + path + query string) is sent as the referrer. This preserves analytics functionality.
- **Cross-origin requests:** Only the **origin** (scheme + host) is sent, stripping the path and query parameters. This prevents leaking sensitive URL data to third-party services.
- **HTTPS → HTTP downgrade:** No referrer is sent at all, preventing information leakage over insecure channels.

#### `Permissions-Policy: camera=(), microphone=(), geolocation=()`
Explicitly disables access to sensitive browser APIs that this application does not use. This is a **defense-in-depth** measure: even if an XSS vulnerability is exploited, the injected script cannot access the user's camera, microphone, or location.

---

## Phase 4: Post-Mitigation Validation

### 4.1 Verified Response Headers

After deploying the `vercel.json` configuration, the following `curl -I` output confirms that all security headers are correctly injected:

```
~ ▓▒░ curl -I https://managustin.vercel.app/                                                     ░▒▓ ✔  25s  12:52:14
HTTP/2 200
accept-ranges: bytes
access-control-allow-origin: *
age: 84
cache-control: public, max-age=0, must-revalidate
content-disposition: inline
content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; connect-src 'self' https://api.emailjs.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
content-type: text/html; charset=utf-8
date: Fri, 08 May 2026 14:42:50 GMT
etag: "7083d1ce8e2e0eb911de0e02c7bb39e9"
last-modified: Fri, 08 May 2026 14:41:25 GMT
permissions-policy: camera=(), microphone=(), geolocation=()
referrer-policy: strict-origin-when-cross-origin
server: Vercel
strict-transport-security: max-age=63072000; includeSubDomains; preload
x-content-type-options: nosniff
x-frame-options: DENY
x-vercel-cache: HIT
x-vercel-id: gru1::ldlkm-1778251370483-3728067bd15a
content-length: 11803
```

### 4.2 Validation Checklist

| # | Check | Method | Expected Result |
|---|-------|--------|-----------------|
| V-01 | HSTS header present | `curl -I` | `strict-transport-security: max-age=63072000; includeSubDomains; preload` |
| V-02 | CSP header present | `curl -I` | Full CSP string as configured |
| V-03 | X-Frame-Options present | `curl -I` | `DENY` |
| V-04 | X-Content-Type-Options present | `curl -I` | `nosniff` |
| V-05 | Referrer-Policy present | `curl -I` | `strict-origin-when-cross-origin` |
| V-06 | Permissions-Policy present | `curl -I` | `camera=(), microphone=(), geolocation=()` |
| V-07 | EmailJS functional | Manual test | Contact form sends successfully (no CSP violations in browser console) |
| V-08 | No console errors | DevTools | Zero `Refused to load` or `Blocked` CSP errors |

---

## Automated Tools

I developed a custom Python-based scanner to perform concurrent port analysis and SSL health checks. The tool is available as a GitHub Gist: https://gist.github.com/managustin/67e1a2dfade0ff97a21192f1c639e19a

---

## Appendix: Full Nmap Output

The complete `nmap` scan output is included below for reference and reproducibility:

```
~ ▓▒░ nmap -sV -Pn --script ssl-enum-ciphers -p 443 managustin.vercel.app                        ░▒▓ ✔  24s  12:30:05
Starting Nmap 7.94SVN ( https://nmap.org ) at 2026-05-08 12:32 UTC
Nmap scan report for managustin.vercel.app (64.29.17.67)
Host is up (0.031s latency).
Other addresses for managustin.vercel.app (not scanned): 216.198.79.67

PORT    STATE SERVICE   VERSION
443/tcp open  ssl/https Vercel
|_http-server-header: Vercel
| ssl-enum-ciphers:
|   TLSv1.2:
|     ciphers:
|       TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256 (secp256r1) - A
|       TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256 (secp256r1) - A
|       TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 (secp256r1) - A
|       TLS_DHE_RSA_WITH_AES_256_GCM_SHA384 (dh 2048) - A
|     compressors:
|       NULL
|     cipher preference: server
|   TLSv1.3:
|     ciphers:
|       TLS_AKE_WITH_AES_128_GCM_SHA256 (ecdh_x25519) - A
|       TLS_AKE_WITH_AES_256_GCM_SHA384 (ecdh_x25519) - A
|       TLS_AKE_WITH_CHACHA20_POLY1305_SHA256 (ecdh_x25519) - A
|     cipher preference: server
|_  least strength: A
| fingerprint-strings:
|   FourOhFourRequest:
|     HTTP/1.0 404 Not Found
|     Cache-Control: public, max-age=0, must-revalidate
|     Content-Length: 107
|     Content-Type: text/plain; charset=utf-8
|     Date: Fri, 08 May 2026 12:32:34 GMT
|     Server: Vercel
|     Strict-Transport-Security: max-age=63072000
|     X-Vercel-Error: DEPLOYMENT_NOT_FOUND
|     X-Vercel-Id: gru1::lggxg-1778243554352-ddaf90028f12
|     deployment could not be found on Vercel.
|     DEPLOYMENT_NOT_FOUND
|     gru1::lggxg-1778243554352-ddaf90028f12
|   GenericLines, Help, RTSPRequest:
|     HTTP/1.1 400 Bad Request
|     Content-Type: text/plain; charset=utf-8
|     Connection: close
|     Request
|   GetRequest:
|     HTTP/1.0 404 Not Found
|     Cache-Control: public, max-age=0, must-revalidate
|     Content-Length: 107
|     Content-Type: text/plain; charset=utf-8
|     Date: Fri, 08 May 2026 12:32:33 GMT
|     Server: Vercel
|     Strict-Transport-Security: max-age=63072000
|     X-Vercel-Error: DEPLOYMENT_NOT_FOUND
|     X-Vercel-Id: gru1::rz5fz-1778243553906-bec7083a3735
|     deployment could not be found on Vercel.
|     DEPLOYMENT_NOT_FOUND
|     gru1::rz5fz-1778243553906-bec7083a3735
|   HTTPOptions:
|     HTTP/1.0 404 Not Found
|     Cache-Control: public, max-age=0, must-revalidate
|     Content-Length: 107
|     Content-Type: text/plain; charset=utf-8
|     Date: Fri, 08 May 2026 12:32:34 GMT
|     Server: Vercel
|     Strict-Transport-Security: max-age=63072000
|     X-Vercel-Error: DEPLOYMENT_NOT_FOUND
|     X-Vercel-Id: gru1::cqfkp-1778243554118-271ffd9223d8
|     deployment could not be found on Vercel.
|     DEPLOYMENT_NOT_FOUND
|_    gru1::cqfkp-1778243554118-271ffd9223d8
1 service unrecognized despite returning data. If you know the service/version, please submit the following
fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port443-TCP:V=7.94SVN%T=SSL%I=7%D=5/8%Time=69FDD7E1%P=x86_64-pc-linux-g
SF:nu%r(GetRequest,1B3,"HTTP/1\.0\x20404\x20Not\x20Found\r\nCache-Control:
SF:\x20public,\x20max-age=0,\x20must-revalidate\r\nContent-Length:\x20107\
SF:r\nContent-Type:\x20text/plain;\x20charset=utf-8\r\nDate:\x20Fri,\x2008
SF:\x20May\x202026\x2012:32:33\x20GMT\r\nServer:\x20Vercel\r\nStrict-Trans
SF:port-Security:\x20max-age=63072000\r\nX-Vercel-Error:\x20DEPLOYMENT_NOT
SF:_FOUND\r\nX-Vercel-Id:\x20gru1::rz5fz-1778243553906-bec7083a3735\r\n\r\
SF:nThe\x20deployment\x20could\x20not\x20be\x20found\x20on\x20Vercel\.\n\n
SF:DEPLOYMENT_NOT_FOUND\n\ngru1::rz5fz-1778243553906-bec7083a3735\n")%r(HT
SF:TPOptions,1B3,"HTTP/1\.0\x20404\x20Not\x20Found\r\nCache-Control:\x20pu
SF:blic,\x20max-age=0,\x20must-revalidate\r\nContent-Length:\x20107\r\nCon
SF:tent-Type:\x20text/plain;\x20charset=utf-8\r\nDate:\x20Fri,\x2008\x20Ma
SF:y\x202026\x2012:32:34\x20GMT\r\nServer:\x20Vercel\r\nStrict-Transport-S
SF:ecurity:\x20max-age=63072000\r\nX-Vercel-Error:\x20DEPLOYMENT_NOT_FOUND
SF:\r\nX-Vercel-Id:\x20gru1::cqfkp-1778243554118-271ffd9223d8\r\n\r\nThe\x
SF:20deployment\x20could\x20not\x20be\x20found\x20on\x20Vercel\.\n\nDEPLOY
SF:MENT_NOT_FOUND\n\ngru1::cqfkp-1778243554118-271ffd9223d8\n")%r(FourOhFo
SF:urRequest,1B3,"HTTP/1\.0\x20404\x20Not\x20Found\r\nCache-Control:\x20pu
SF:blic,\x20max-age=0,\x20must-revalidate\r\nContent-Length:\x20107\r\nCon
SF:tent-Type:\x20text/plain;\x20charset=utf-8\r\nDate:\x20Fri,\x2008\x20Ma
SF:y\x202026\x2012:32:34\x20GMT\r\nServer:\x20Vercel\r\nStrict-Transport-S
SF:ecurity:\x20max-age=63072000\r\nX-Vercel-Error:\x20DEPLOYMENT_NOT_FOUND
SF:\r\nX-Vercel-Id:\x20gru1::lggxg-1778243554352-ddaf90028f12\r\n\r\nThe\x
SF:20deployment\x20could\x20not\x20be\x20found\x20on\x20Vercel\.\n\nDEPLOY
SF:MENT_NOT_FOUND\n\ngru1::lggxg-1778243554352-ddaf90028f12\n")%r(GenericL
SF:ines,67,"HTTP/1\.1\x20400\x20Bad\x20Request\r\nContent-Type:\x20text/pl
SF:ain;\x20charset=utf-8\r\nConnection:\x20close\r\n\r\n400\x20Bad\x20Requ
SF:est")%r(RTSPRequest,67,"HTTP/1\.1\x20400\x20Bad\x20Request\r\nContent-T
SF:ype:\x20text/plain;\x20charset=utf-8\r\nConnection:\x20close\r\n\r\n400
SF:\x20Bad\x20Request")%r(Help,67,"HTTP/1\.1\x20400\x20Bad\x20Request\r\nC
SF:ontent-Type:\x20text/plain;\x20charset=utf-8\r\nConnection:\x20close\r\
SF:n\r\n400\x20Bad\x20Request");

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 114.51 seconds
```
