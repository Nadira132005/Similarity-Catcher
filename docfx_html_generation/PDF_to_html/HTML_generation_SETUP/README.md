# HTML Documentation Generation Setup

This folder contains all the necessary files and scripts to generate HTML documentation from your C# projects using DocFX.

## 📁 Files in this Setup

### Scripts
- **`generate_html_docs.sh`** - Bash script for Linux/macOS/WSL
- **`generate_html_docs.ps1`** - PowerShell script for Windows
- **`pipeline_updated.yml`** - GitLab CI pipeline configuration

### Configuration Files  
- **`docfx.json`** - Main DocFX configuration file
- **`main_toc.yml`** - Main table of contents (rename to `toc.yml`)
- **`docs_toc.yml`** - Documentation table of contents (place in `docs/toc.yml`)

### Documentation
- **`DOCUMENTATION_GUIDE.md`** - Complete guide explaining the process
- **`README.md`** - This file

## 🚀 Quick Start

### Step-by-Step Process

**Step 1: Copy Setup**
```bash
cp -r HTML_generation_SETUP /path/to/your/project/
```

**Step 2: Run Universal Installer**
```bash
# Linux/macOS/WSL
cd /path/to/your/project/HTML_generation_SETUP
chmod +x universal_install.sh
./universal_install.sh /path/to/your/project

# Windows PowerShell
cd C:\path\to\your\project\HTML_generation_SETUP
.\universal_install.ps1 "C:\path\to\your\project"
```

**Step 3: Enable XML Documentation**
Add to your .csproj files:
```xml
<PropertyGroup>
  <GenerateDocumentationFile>true</GenerateDocumentationFile>
</PropertyGroup>
```

**Step 4: Add XML Comments**
```csharp
/// <summary>
/// Your class description here
/// </summary>
public class YourClass
{
    /// <summary>
    /// Your method description here
    /// </summary>
    public void YourMethod() { }
}
```

**Step 5: Generate Documentation**
```bash
cd /path/to/your/project
./generate_html_docs.sh    # Linux/macOS/WSL
# OR
.\generate_html_docs.ps1   # Windows
```

**Step 6: View Results**
Open `docfx/_site/toc.html` in your browser

---

### Alternative Options

### Option 1: Universal Installer (Recommended)

**For Linux/macOS/WSL:**
```bash
chmod +x universal_install.sh
./universal_install.sh /path/to/your/project
```

**For Windows PowerShell:**
```powershell
.\universal_install.ps1 "C:\path\to\your\project"
```

The universal installer will:
- ✅ Analyze your project structure
- ✅ Generate custom configuration for your projects
- ✅ Create sample documentation
- ✅ Set up everything automatically

### Option 2: Run Local Script

**For Windows:**
```powershell
.\generate_html_docs.ps1
```

**For Linux/macOS/WSL:**
```bash
chmod +x generate_html_docs.sh
./generate_html_docs.sh
```

### Option 3: Manual Setup

1. **Install DocFX:**
   ```bash
   dotnet tool install -g docfx
   ```

2. **Copy configuration files:**
   - Copy `docfx.json` to your project's `docfx/` directory
   - Rename `main_toc.yml` to `toc.yml` in `docfx/` directory
   - Rename `docs_toc.yml` to `toc.yml` in `docfx/docs/` directory

3. **Run generation:**
   ```bash
   cd your-project/docfx
   docfx docfx.json
   ```

### Option 3: GitLab CI Pipeline

Copy the content from `pipeline_updated.yml` to your `.gitlab-ci.yml` file.

## 📋 Prerequisites

- **.NET SDK** (6.0 or later)
- **DocFX** (automatically installed by scripts)
- **C# projects** with XML documentation enabled
- **Markdown documentation files**

## 🎯 What Gets Generated

The process creates:

- **API Documentation** - From your C# XML comments
- **User Documentation** - From your markdown files
- **Cross-references** - Links between API and docs
- **Search functionality** - Full-text search
- **Professional styling** - Modern, responsive design

## 📁 Expected Project Structure

```
your-project/
├── docfx/
│   ├── docfx.json          # Main configuration
│   ├── toc.yml             # Main table of contents
│   └── docs/               # Documentation content
│       ├── toc.yml         # Docs table of contents
│       ├── architecture/   # Architecture docs
│       ├── testautomation/ # Test automation docs
│       └── analytics/      # Analytics docs
└── src/                    # C# source code
    ├── Project1/
    ├── Project2/
    └── ...
```

## 🔧 Customization

### Modify docfx.json to:
- Change which projects to include
- Adjust output settings
- Configure templates and themes
- Set metadata and branding

### Modify toc.yml files to:
- Change navigation structure
- Add/remove documentation sections
- Organize content hierarchy

## 📤 Output

After generation, you'll find:

- **HTML Website** in `_site/` folder
- **Organized Archive** in `_site/_html/` folder
- **Main Entry Point** at `_site/toc.html`

## 🆘 Troubleshooting

1. **Build Errors**: Ensure all C# projects can build successfully
2. **Missing Documentation**: Check that XML documentation is enabled in .csproj files
3. **Broken Links**: Verify file paths in markdown and toc.yml files
4. **Missing Assets**: Check that image and resource files exist

## 🔗 Integration

### Enable XML Documentation in .csproj:
```xml
<PropertyGroup>
  <GenerateDocumentationFile>true</GenerateDocumentationFile>
</PropertyGroup>
```

### Example XML Comments:
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

## 📞 Support

For detailed information, see `DOCUMENTATION_GUIDE.md` in this folder.

## ✅ Success Criteria

After running the generation, you should have:
- ✅ HTML files in `_site/` directory
- ✅ Functional navigation and search
- ✅ API documentation from your C# code
- ✅ Documentation pages from your markdown files
- ✅ Professional styling and responsive design

---
*Generated HTML documentation provides a professional, searchable, and navigable interface for your project's API and user documentation.*
