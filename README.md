# prelegal
A platform for drafting common legal agreement

## Template dataset

`templates/` holds the legal document templates the system fills in and adapts for each user.

- Each template is a Markdown file with `{{variable_name}}` placeholders.
- `templates/catalog.json` lists every template with its title, category, description and the variables it needs. Each variable has a label, a type (`string`, `text`, `date`, `number`, `email` or `url`) and an example value.

| ID | Title | Category |
|---|---|---|
| `mutual-nda` | Mutual Non-Disclosure Agreement | confidentiality |
| `one-way-nda` | Non-Disclosure Agreement (One-Way) | confidentiality |
| `independent-contractor-agreement` | Independent Contractor Agreement | services |
| `employment-offer-letter` | Employment Offer Letter | employment |
| `website-terms-of-service` | Website Terms of Service | online |
| `privacy-policy` | Privacy Policy | online |
| `payment-demand-letter` | Demand Letter for Payment | disputes |
| `cease-and-desist-letter` | Cease and Desist Letter | disputes |

To add a template, create the Markdown file in `templates/`, add its entry to `catalog.json`, and run the validator:

```
python scripts/validate_templates.py
```

The validator checks that every placeholder is declared in the catalog (and every declared variable is used), and that each template renders cleanly with its example values.

The templates are general starting points, not legal advice. They are not tailored to any jurisdiction and should be reviewed by a qualified lawyer before use.
