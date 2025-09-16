# Quick Reference - HTML Documentation Generation

## 🚀 6-Step Setup Process

```bash
# Step 1: Copy setup to your project
cp -r HTML_generation_SETUP /path/to/your/project/

# Step 2: Run universal installer  
cd /path/to/your/project/HTML_generation_SETUP
./universal_install.sh /path/to/your/project

# Step 3: Enable XML documentation in .csproj files
# Add: <GenerateDocumentationFile>true</GenerateDocumentationFile>

# Step 4: Add XML comments to your C# code
# Use /// <summary> tags above classes and methods

# Step 5: Generate documentation
cd /path/to/your/project
./generate_html_docs.sh

# Step 6: Open result
open docfx/_site/toc.html
```

## 📋 Essential Commands

```bash
# Install DocFX
dotnet tool install -g docfx

# Generate docs
docfx docfx.json

# Generate with verbose output
docfx docfx.json --verbose

# Serve locally for testing
docfx docfx.json --serve
```

## 🔧 Required Files

| File | Location | Purpose |
|------|----------|---------|
| `docfx.json` | `docfx/` | Main configuration |
| `toc.yml` | `docfx/` | Main navigation |
| `toc.yml` | `docfx/docs/` | Docs navigation |
| `*.md` | `docfx/docs/` | Documentation content |

## 🎯 Key Configuration Points

### Enable XML Documentation in .csproj:
```xml
<PropertyGroup>
  <GenerateDocumentationFile>true</GenerateDocumentationFile>
</PropertyGroup>
```

### DocFX Metadata Section:
```json
"metadata": [{
  "src": [{
    "files": ["src/**/*.csproj"],
    "src": "../"
  }],
  "dest": "api"
}]
```

### DocFX Build Section:
```json
"build": {
  "content": [{"files": ["**/*.{md,yml}"]}],
  "output": "_site",
  "template": ["default", "modern"]
}
```

## 📁 Output Structure

```
_site/
├── toc.html          # 👈 START HERE
├── api/              # API docs from C# code
├── docs/             # User docs from markdown
└── public/           # CSS, JS, assets
```

## ⚡ Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| Build errors | Check .csproj files can build |
| Missing docs | Enable XML documentation |
| Broken links | Check file paths in toc.yml |
| No search | Ensure `_enableSearch: true` |
| PDF errors | Ignore - HTML generation still works |

## 🔗 Cross-References in Markdown

```markdown
# Link to API classes
See <xref:YourNamespace.YourClass> for details.

# Link to methods
Use <xref:YourNamespace.YourClass.YourMethod*> 

# Link to other docs
[Architecture](architecture/Architecture.md)
```

## 📤 CI/CD Integration

```yaml
# GitLab CI
generate-docs:
  script:
    - dotnet tool install -g docfx
    - cd docfx && docfx docfx.json
  artifacts:
    paths: [docfx/_site/]
```

## ✅ Success Checklist

- [ ] DocFX installed (`docfx --version`)
- [ ] XML documentation enabled in projects
- [ ] `docfx.json` configured correctly
- [ ] Table of contents files created
- [ ] Markdown files in place
- [ ] `docfx docfx.json` runs successfully
- [ ] `_site/toc.html` opens in browser
- [ ] Navigation and search work
- [ ] API documentation visible
- [ ] Documentation pages accessible

---

**🎉 Result**: Professional HTML documentation website with API reference, user guides, search, and navigation!
