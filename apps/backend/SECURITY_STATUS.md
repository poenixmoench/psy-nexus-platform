Bekannte Schwachstellen nach Remediation:
- request: Entfernt aus Backend-Projekt
- lodash: Moderate Schwachstelle in dev-Abhängigkeit (@mrleebo/prisma-ast), kein direkter Fix verfügbar
- hono: Moderate Schwachstelle in dev-Abhängigkeit (@prisma/dev), kein direkter Fix verfügbar
- semver, qs, tough-cookie, form-data: Teil der request-Abhängigkeitskette, request entfernt
- sqlite3: Hoch-kritisch, aber in dev-Abhängigkeit, nicht in produktivem Backend-Code
- tar: Hoch-kritisch, aber in dev-Abhängigkeit (node-pre-gyp), nicht in produktivem Backend-Code

Diese betreffen nicht das laufende Backend, sondern Development-Tools.
