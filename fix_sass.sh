#!/bin/bash

# Script to fix Sass compatibility issues by replacing newer syntax with older syntax

# Replace @use with @import
find ./src -name "*.scss" -type f -exec sed -i '' 's/@use '\''\.\.\/common\/index'\'' as \*;/@import '\''\.\.\/common\/variables'\''\;\n@import '\''\.\.\/common\/colors'\'';/g' {} \;
find ./src -name "*.scss" -type f -exec sed -i '' 's/@use '\''\.\.\/\.\.\/common\/index'\'' as \*;/@import '\''\.\.\/\.\.\/common\/variables'\''\;\n@import '\''\.\.\/\.\.\/common\/colors'\'';/g' {} \;
find ./src -name "*.scss" -type f -exec sed -i '' 's/@use '\''\.\.\/common\/variables'\'' as \*;/@import '\''\.\.\/common\/variables'\'';/g' {} \;

# Remove sass:color imports
find ./src -name "*.scss" -type f -exec sed -i '' 's/@use '\''sass:color'\'';// g' {} \;
find ./src -name "*.scss" -type f -exec sed -i '' 's/@import '\''sass:color'\'';// g' {} \;

# Replace color.adjust with darken/lighten
find ./src -name "*.scss" -type f -exec sed -i '' 's/color\.adjust(\$\([a-zA-Z0-9_-]*\), \$lightness: -\([0-9]*\)%)/darken(\$\1, \2%)/g' {} \;
find ./src -name "*.scss" -type f -exec sed -i '' 's/color\.adjust(\$\([a-zA-Z0-9_-]*\), \$lightness: \([0-9]*\)%)/lighten(\$\1, \2%)/g' {} \;

# Handle special cases for hex colors
find ./src -name "*.scss" -type f -exec sed -i '' 's/color\.adjust(#\([a-zA-Z0-9]*\), \$lightness: -\([0-9]*\)%)/darken(#\1, \2%)/g' {} \;
find ./src -name "*.scss" -type f -exec sed -i '' 's/color\.adjust(#\([a-zA-Z0-9]*\), \$lightness: \([0-9]*\)%)/lighten(#\1, \2%)/g' {} \;

# Handle rgba colors
find ./src -name "*.scss" -type f -exec sed -i '' 's/color\.adjust(rgba(\([^)]*\)), \$lightness: -\([0-9]*\)%)/darken(rgba(\1), \2%)/g' {} \;
find ./src -name "*.scss" -type f -exec sed -i '' 's/color\.adjust(rgba(\([^)]*\)), \$lightness: \([0-9]*\)%)/lighten(rgba(\1), \2%)/g' {} \;

echo "Sass compatibility fixes applied!"
