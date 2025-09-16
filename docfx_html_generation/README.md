clone the runner in PDF_to_html folder

in runner:
dotnet tool list -g | grep docfx || dotnet tool install -g docfx
in runner/docfx :
./generate_toc.sh .
docfx build ---NEAPARAT

cd docfx && docfx docfx.json --NEAPARAT
in runner:
grep -r "OSLC4Net" src/ --include="_.csproj"
grep -r "OSLC4Net" src/ --include="_.cs" | head -5
grep -r "using OSLC4Net" src/ | cut -d: -f1 | sort | uniq

v2
./generate_html_docs.sh
