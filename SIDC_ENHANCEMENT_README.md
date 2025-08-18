# Enhanced SIDC Mappings with Milsymbol Integration

## Overview

The SIDC (Symbol Identification Coding) mappings have been enhanced to leverage the `milsymbol` library for validation, metadata extraction, and improved symbol generation while maintaining compatibility with the existing codebase. **Main icons and modifiers now render correctly** with enhanced symbol set data access.

## Key Improvements

### 1. Library Integration
- **Validation**: Uses milsymbol library to validate SIDC codes
- **Metadata**: Extracts human-readable metadata from symbols
- **Parsing**: Provides utilities to parse SIDC components

### 2. Enhanced Symbol Set Data Access ✨ **NEW**
- **Flexible Name Resolution**: Handles different naming conventions (e.g., "Land Unit", "LAND_UNIT", "land unit")
- **Enhanced Main Icons**: Proper access to all main icon data
- **Modifier Support**: Improved modifier1 and modifier2 data access
- **Fallback Logic**: Graceful handling of missing or misnamed symbol sets

### 3. Enhanced Code Organization
- **Core Mappings**: Clean, well-documented mapping constants
- **Validation Utilities**: Built-in SIDC validation using the library
- **Legacy Compatibility**: Maintains existing API for smooth migration

### 3. Developer Experience
- **Type Safety**: Improved TypeScript definitions
- **Error Handling**: Better error reporting and fallbacks
- **Debugging**: Development mode logging for metadata
- **Visual Feedback**: Invalid symbols are highlighted with red border

## API Changes

### New Functions for Symbol Set Data ✨ **NEW**

#### `getSymbolSetData(symbolSetName: string)`
Enhanced symbol set data access with flexible name resolution.

```typescript
import { getSymbolSetData } from "@/lib/sidc-mappings";

// Works with any naming convention
const landData = getSymbolSetData("Land Unit");
const airData = getSymbolSetData("AIR");
const activitiesData = getSymbolSetData("activities");
```

#### `getMainIconOptions(symbolSet: string)`
Get all main icon options for a symbol set.

```typescript
import { getMainIconOptions } from "@/lib/sidc-mappings";

const icons = getMainIconOptions("Land Unit");
// Returns: [{ name: "Unspecified", code: "000000" }, { name: "Infantry", code: "110600" }, ...]
```

#### `getModifier1Options(symbolSet: string)` & `getModifier2Options(symbolSet: string)`
Get modifier options for a symbol set.

```typescript
import { getModifier1Options, getModifier2Options } from "@/lib/sidc-mappings";

const mod1 = getModifier1Options("Air");
const mod2 = getModifier2Options("Air");
```

#### `getAllSymbolSetNames()` & `getSymbolSetDisplayName(code: string)`
Utility functions for symbol set management.

```typescript
import { getAllSymbolSetNames, getSymbolSetDisplayName } from "@/lib/sidc-mappings";

const allSets = getAllSymbolSetNames(); // ["Activities", "Air", "Land Unit", ...]
const displayName = getSymbolSetDisplayName("10"); // "Land Unit"
```

### Enhanced Validation Functions

#### `validateSIDC(sidc: string): boolean`
Validates a SIDC code using the milsymbol library.

```typescript
import { validateSIDC } from "@/lib/sidc-generator";

const isValid = validateSIDC("10031000000000000000");
console.log(isValid); // true/false
```

#### `getSIDCMetadata(sidc: string)`
Extracts metadata from a SIDC code.

```typescript
import { getSIDCMetadata } from "@/lib/sidc-generator";

const metadata = getSIDCMetadata("10031000000000000000");
console.log(metadata);
// {
//   affiliation: 'Friend',
//   context: 'Reality',
//   dimension: 'Ground',
//   headquarters: false,
//   valid: true
// }
```

#### `SIDCValidator` Class
Utility class for SIDC operations.

```typescript
import { SIDCValidator } from "@/lib/sidc-mappings";

// Validate
const isValid = SIDCValidator.validate(sidc);

// Get metadata
const metadata = SIDCValidator.getMetadata(sidc);

// Parse components
const components = SIDCValidator.parse(sidc);
```

### Enhanced Components

#### MilitarySymbol Component
- **Validation**: Automatically validates SIDC codes
- **Visual Indicators**: Invalid symbols show red border
- **Enhanced Tooltips**: Include validation status
- **Development Logging**: Logs metadata in development mode

## Migration Guide

### No Breaking Changes
All existing code continues to work without modifications. The enhancements are additive.

### Optional Enhancements
You can optionally use new features:

1. **Add validation checks**:
```typescript
const sidc = generateSIDC(symbol);
if (!validateSIDC(sidc)) {
  console.warn('Invalid SIDC generated:', sidc);
}
```

2. **Use metadata for debugging**:
```typescript
const metadata = getSIDCMetadata(sidc);
console.log('Symbol metadata:', metadata);
```

3. **Parse SIDC components**:
```typescript
const components = SIDCValidator.parse(sidc);
console.log('SIDC components:', components);
```

## Technical Details

### Mapping Structure
The core mappings remain the same but are now organized as typed constants:

```typescript
export const contextMappings = {
  REALITY: "0",
  EXERCISE: "1", 
  SIMULATION: "2",
} as const;
```

### Library Integration
Uses milsymbol for:
- **Symbol Creation**: Primary symbol rendering
- **Validation**: Checking SIDC validity
- **Metadata**: Extracting symbol information

### Error Handling
- Graceful fallbacks for invalid symbols
- Console warnings for debugging
- Visual indicators for users

## Benefits

1. **Reliability**: Built-in validation prevents invalid symbols
2. **Debugging**: Better error reporting and metadata access
3. **Maintainability**: Cleaner code organization
4. **Future-Proof**: Leverages standard library capabilities
5. **Compatibility**: No breaking changes to existing code

## Testing

The implementation includes comprehensive testing:

```bash
node test-enhanced-sidc.js
```

This validates that:
- SIDC generation works correctly
- Milsymbol integration functions properly
- Metadata extraction is accurate
- Symbol validation works as expected

## Next Steps

Future enhancements could include:
1. **Symbol Library**: Pre-built symbol collections
2. **Advanced Validation**: Custom validation rules
3. **Performance**: Caching for frequently used symbols
4. **Internationalization**: Multi-language metadata support
