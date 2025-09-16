# HTML Documentation Generation Guide

This guide explains how to generate HTML documentation from your C# source code using DocFX.

## 🚀 Quick Start Steps

### Step 1: Copy Setup to Your Project
```bash
# Copy the HTML_generation_SETUP folder to your project
cp -r HTML_generation_SETUP /path/to/your/project/

# Navigate to the setup folder
cd /path/to/your/project/HTML_generation_SETUP
```

### Step 2: Run Universal Installer
```bash
# For Linux/macOS/WSL
chmod +x universal_install.sh
./universal_install.sh /path/to/your/project

# For Windows PowerShell
.\universal_install.ps1 "C:\path\to\your\project"
```

### Step 3: Enable XML Documentation (Important!)
Add this to all your .csproj files:
```xml
<PropertyGroup>
  <GenerateDocumentationFile>true</GenerateDocumentationFile>
</PropertyGroup>
```

### Step 4: Add XML Comments to Your Code
```csharp
/// <summary>
/// This class handles test execution.
/// </summary>
/// <remarks>
/// Use this class to run automated tests with various configurations.
/// </remarks>
public class TestRunner
{
    /// <summary>
    /// Executes a test with the specified configuration.
    /// </summary>
    /// <param name="config">The test configuration</param>
    /// <returns>Test execution results</returns>
    public TestResult Execute(TestConfiguration config) { }
}
```

### Step 5: Generate Documentation
```bash
# Navigate to your project root
cd /path/to/your/project

# Run the generation script
./generate_html_docs.sh     # Linux/macOS/WSL
# OR
.\generate_html_docs.ps1    # Windows PowerShell
```

### Step 6: View Your Documentation
```bash
# Open the generated HTML documentation
open docfx/_site/toc.html   # macOS
xdg-open docfx/_site/toc.html   # Linux
start docfx\_site\toc.html  # Windows
```

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

### Step-by-Step Troubleshooting:

#### Problem: "No documentation appears in API section"
**Solution:**
1. Check if XML documentation is enabled:
   ```xml
   <PropertyGroup>
     <GenerateDocumentationFile>true</GenerateDocumentationFile>
   </PropertyGroup>
   ```
2. Rebuild your projects: `dotnet build`
3. Verify XML files are generated in `bin/Debug/` folders
4. Re-run DocFX: `docfx docfx.json`

#### Problem: "Build fails with project errors"
**Solution:**
1. Test project builds independently: `dotnet build src/YourProject/`
2. Check for missing NuGet packages: `dotnet restore`
3. Verify .NET SDK version compatibility
4. Check the docfx.json file paths are correct

#### Problem: "Documentation links are broken"
**Solution:**
1. Verify file structure matches toc.yml references
2. Check markdown file paths are relative to docs/ folder
3. Ensure all referenced .md files exist
4. Use forward slashes (/) in paths, even on Windows

#### Problem: "Images not showing in documentation"
**Solution:**
1. Place images in `docs/images/` or `docs/assets/` folder
2. Reference images relative to the markdown file location
3. Add image folders to docfx.json resource section:
   ```json
   "resource": [
     {
       "files": ["images/**/*", "assets/**/*"],
       "src": "docs"
     }
   ]
   ```

#### Problem: "Search functionality not working"
**Solution:**
1. Ensure `_enableSearch: true` in docfx.json globalMetadata
2. Check that index.json file is generated in _site/
3. Serve the site properly (file:// protocol has limitations)
4. Use `docfx docfx.json --serve` for local testing

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

## Complete Workflow Example

Here's a complete example of setting up documentation for a new project:

### Starting with a Fresh C# Project

```bash
# 1. You have a C# project structure like this:
MyProject/
├── src/
│   ├── MyProject.Core/
│   │   └── MyProject.Core.csproj
│   ├── MyProject.API/
│   │   └── MyProject.API.csproj
│   └── MyProject.Tests/
│       └── MyProject.Tests.csproj
└── README.md

# 2. Copy the HTML generation setup
cp -r HTML_generation_SETUP MyProject/

# 3. Run the universal installer
cd MyProject/HTML_generation_SETUP
./universal_install.sh ../

# 4. Enable XML documentation in your .csproj files
# Add to MyProject.Core.csproj and MyProject.API.csproj:
```

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <GenerateDocumentationFile>true</GenerateDocumentationFile>
  </PropertyGroup>
</Project>
```

```bash
# 5. Add XML comments to your C# classes
```

```csharp
namespace MyProject.Core
{
    /// <summary>
    /// Provides core business logic for the application.
    /// </summary>
    /// <remarks>
    /// This service handles the main operations and coordinates 
    /// between different components of the system.
    /// </remarks>
    public class BusinessService
    {
        /// <summary>
        /// Processes a business operation with the given parameters.
        /// </summary>
        /// <param name="input">The input data for processing</param>
        /// <param name="options">Optional configuration parameters</param>
        /// <returns>The result of the business operation</returns>
        /// <exception cref="ArgumentNullException">
        /// Thrown when input is null
        /// </exception>
        /// <example>
        /// <code>
        /// var service = new BusinessService();
        /// var result = await service.ProcessAsync(inputData, options);
        /// </code>
        /// </example>
        public async Task<BusinessResult> ProcessAsync(
            BusinessInput input, 
            ProcessingOptions options = null)
        {
            // Implementation here
        }
    }
}
```

```bash
# 6. Customize the generated documentation
# Edit docfx/docs/getting-started.md with your project info
# Edit docfx/docs/toc.yml to match your documentation structure
# Add more .md files as needed

# 7. Generate the documentation
cd MyProject
./generate_html_docs.sh

# 8. View the results
open docfx/_site/toc.html

# Your documentation will include:
# - API documentation for BusinessService class
# - Getting started guide
# - User and developer guides
# - Search functionality
# - Professional styling
```

### Directory Structure After Setup

```
MyProject/
├── src/                              # Your source code
│   ├── MyProject.Core/
│   └── MyProject.API/
├── docfx/                           # Documentation configuration
│   ├── docfx.json                   # DocFX settings (auto-generated)
│   ├── toc.yml                      # Main navigation
│   ├── docs/                        # Your documentation content
│   │   ├── toc.yml                  # Docs navigation
│   │   ├── getting-started.md       # Project overview
│   │   ├── user-guide/              # User documentation
│   │   └── developer-guide/         # Developer documentation
│   └── _site/                       # Generated HTML (after running)
│       ├── toc.html                 # Main entry point
│       ├── api/                     # API documentation
│       └── docs/                    # User documentation
├── generate_html_docs.sh            # Generation script
├── generate_html_docs.ps1           # PowerShell version
└── DOCUMENTATION_GUIDE.md           # This guide
```

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
