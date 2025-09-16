# HTML Documentation Generation Guide

This guide explains how to generate HTML documentation from your C# source code using DocFX.

## What DocFX Does

DocFX extracts documentation from:
1. **XML Documentation Comments** in your C# source code (///)
2. **Markdown files** (.md) in your documentation folders
3. **Project metadata** from .csproj files

It then generates a complete HTML website with:
- API documentation with full class/method details
- Cross-references between code and documentation
- Search functionality
- Navigation and table of contents
- Professional styling

## Prerequisites

1. **.NET SDK** - Required to run DocFX
2. **DocFX tool** - Installed via `dotnet tool install -g docfx`

## File Structure

```
project/
├── runner/
│   ├── docfx/
│   │   ├── docfx.json          # DocFX configuration
│   │   ├── toc.yml             # Main table of contents
│   │   └── docs/               # Documentation content
│   │       ├── toc.yml         # Docs table of contents
│   │       ├── architecture/   # Architecture docs
│   │       ├── testautomation/ # Test automation docs
│   │       └── analytics/      # Analytics docs
│   └── src/                    # C# source code projects
│       ├── Project1/
│       ├── Project2/
│       └── ...
```

## DocFX Configuration (docfx.json)

The key parts of the configuration:

```json
{
  "metadata": [
    {
      "src": [
        {
          "files": [
            "src/Project1/*.csproj",
            "src/Project2/*.csproj"
          ],
          "src": "../"
        }
      ],
      "dest": "api",
      "outputFormat": "apiPage"
    }
  ],
  "build": {
    "content": [
      {
        "files": ["**/*.{md,yml}"],
        "exclude": ["_site/**"]
      }
    ],
    "output": "_site",
    "template": ["default", "modern"],
    "globalMetadata": {
      "_appName": "Your Documentation",
      "_enableSearch": true,
      "pdf": true
    }
  }
}
```

## Generation Process

### Step 1: Metadata Extraction
DocFX scans your C# projects and extracts:
- Class definitions
- Method signatures
- XML documentation comments (///)
- Assembly information
- Type relationships

### Step 2: Content Processing
DocFX processes:
- Markdown files in the content directories
- YAML table of contents files
- Resource files (images, etc.)

### Step 3: Cross-Reference Resolution
DocFX creates links between:
- API references in markdown
- Type references in code comments
- Related documentation sections

### Step 4: HTML Generation
DocFX generates:
- Individual HTML pages for each type/namespace
- Navigation structure
- Search index
- CSS/JavaScript for functionality

### Step 5: Template Application
DocFX applies:
- Professional styling
- Responsive design
- Bootstrap-based layout
- Search functionality

## Commands Used

```bash
# Install DocFX
dotnet tool install -g docfx

# Generate documentation
docfx docfx.json

# Generate with verbose output
docfx docfx.json --verbose

# Serve locally for development
docfx docfx.json --serve
```

## Output Structure

After generation, `_site/` contains:

```
_site/
├── toc.html              # Main entry point
├── api/                  # Generated API documentation
│   ├── Namespace1.html
│   ├── Class1.html
│   └── ...
├── docs/                 # Processed documentation
│   ├── architecture/
│   ├── testautomation/
│   └── analytics/
├── public/               # CSS, JavaScript, fonts
├── manifest.json         # Site metadata
├── index.json           # Search index
└── xrefmap.yml          # Cross-reference map
```

## XML Documentation Comments

For best results, use XML documentation in your C# code:

```csharp
/// <summary>
/// This class provides test automation functionality.
/// </summary>
/// <remarks>
/// Use this class to configure and run automated tests.
/// </remarks>
public class TestRunner
{
    /// <summary>
    /// Starts the test execution process.
    /// </summary>
    /// <param name="configuration">The test configuration to use</param>
    /// <returns>The test results</returns>
    /// <exception cref="ArgumentNullException">
    /// Thrown when configuration is null
    /// </exception>
    public TestResult Run(TestConfiguration configuration)
    {
        // Implementation
    }
}
```

## Markdown Documentation

Your markdown files can reference API types:

```markdown
# Test Configuration

The <xref:TestRunner> class is used to execute tests.
You can configure it using <xref:TestConfiguration>.

## Example

```csharp
var runner = new TestRunner();
var config = new TestConfiguration();
var result = runner.Run(config);
```

DocFX will automatically create links to the API documentation.

## Troubleshooting

### Common Issues:

1. **Missing XML comments**: Ensure your C# projects generate XML documentation
2. **Broken links**: Check file paths in markdown and toc.yml files
3. **Missing assets**: Verify image and resource file locations
4. **Build errors**: Check that all referenced projects can be built

### Project Configuration:

Add to your .csproj files:
```xml
<PropertyGroup>
  <GenerateDocumentationFile>true</GenerateDocumentationFile>
</PropertyGroup>
```

## Advanced Features

- **Custom templates**: Modify the appearance
- **Plugins**: Extend functionality
- **Multi-language**: Support for multiple programming languages
- **API filtering**: Control what gets documented
- **Versioning**: Support for multiple versions

## Integration with CI/CD

The generation can be automated in GitLab CI:

```yaml
documentation:
  script:
    - dotnet tool install -g docfx
    - cd docfx
    - docfx docfx.json
  artifacts:
    paths:
      - docfx/_site/
```

This creates a complete, professional documentation website from your source code and markdown files.
