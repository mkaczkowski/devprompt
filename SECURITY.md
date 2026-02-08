# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

1. **Do NOT** open a public GitHub issue for security vulnerabilities
2. Email us at **devprompt.ai@gmail.com** or use GitHub's private vulnerability reporting feature
3. Include as much detail as possible:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt within 48 hours
- **Initial Assessment**: We will provide an initial assessment within 7 days
- **Resolution**: We aim to resolve critical vulnerabilities within 30 days
- **Disclosure**: We will coordinate with you on public disclosure timing

### Scope

The following are in scope:

- The DevPrompt web application
- Authentication and authorization issues
- Data exposure vulnerabilities
- Cross-site scripting (XSS)
- Cross-site request forgery (CSRF)
- Injection vulnerabilities

The following are out of scope:

- Third-party services (Clerk, Supabase, etc.) - report directly to those providers
- Social engineering attacks
- Denial of service attacks
- Issues in dependencies - report to the upstream project

## Security Best Practices

When contributing to this project:

1. Never commit secrets, API keys, or credentials
2. Use environment variables for sensitive configuration
3. Sanitize user input (we use DOMPurify)
4. Keep dependencies updated
5. Follow the principle of least privilege

Thank you for helping keep DevPrompt secure!
