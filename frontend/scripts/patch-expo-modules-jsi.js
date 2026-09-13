const fs = require('fs');
const path = require('path');

// 1. Patch RuntimeScheduler.h: remove SWIFT_RETURNS_RETAINED from constructors
const hdrPath = path.resolve(__dirname, '../node_modules/expo-modules-jsi/apple/Sources/ExpoModulesJSI-Cxx/include/RuntimeScheduler.h');
if (fs.existsSync(hdrPath)) {
  let c = fs.readFileSync(hdrPath, 'utf8');
  c = c.split('SWIFT_RETURNS_RETAINED RuntimeScheduler').join('RuntimeScheduler');
  fs.writeFileSync(hdrPath, c);
  console.log('✓ Patched RuntimeScheduler.h constructor annotations');
}

// 2. Patch Package.swift: remove NonisolatedNonsendingByDefault upcoming feature
const pkgPath = path.resolve(__dirname, '../node_modules/expo-modules-jsi/apple/Package.swift');
if (fs.existsSync(pkgPath)) {
  let c = fs.readFileSync(pkgPath, 'utf8');
  c = c.replace(/\.enableUpcomingFeature\("NonisolatedNonsendingByDefault"\),?/g, '');
  fs.writeFileSync(pkgPath, c);
  console.log('✓ Patched Package.swift');
}

// 3. Patch JavaScriptRuntime.swift: pass pointer addresses as UInt to eliminate cross-actor data race errors
const jsrPath = path.resolve(__dirname, '../node_modules/expo-modules-jsi/apple/Sources/ExpoModulesJSI/Runtime/JavaScriptRuntime.swift');
if (fs.existsSync(jsrPath)) {
  let c = fs.readFileSync(jsrPath, 'utf8');

  // Fix getter
  const oldGetter = `      nonisolated(unsafe) let resultPtr = resultPtr

      return withGuaranteedContext(context) { (context: HostObjectContext, runtime) in
        return JavaScriptActor.assumeIsolated {
          return forwardingSwiftErrorsToJS(runtime: runtime) {
            try context.get(propertyName).writeJSIValue(to: resultPtr)`;

  const newGetter = `      let resultAddr = UInt(bitPattern: resultPtr)

      return withGuaranteedContext(context) { (context: HostObjectContext, runtime) in
        return JavaScriptActor.assumeIsolated {
          let resultPtr = UnsafeMutablePointer<facebook.jsi.Value>(bitPattern: resultAddr)!
          return forwardingSwiftErrorsToJS(runtime: runtime) {
            try context.get(propertyName).writeJSIValue(to: resultPtr)`;

  // Fix owning call
  const oldOwning = `    nonisolated(unsafe) let thisPtr = thisPtr
    nonisolated(unsafe) let argumentsPtr = argumentsPtr
    nonisolated(unsafe) let resultPtr = resultPtr

    // See \`withGuaranteedContext\` for why neither the context nor the runtime is retained here, and
    // why the result is written to the caller's slot instead of being returned.
    return withGuaranteedContext(context) { (context: HostFunctionContext, runtime) in
      return JavaScriptActor.assumeIsolated {
        return forwardingSwiftErrorsToJS(runtime: runtime) {
          let this = UnsafeMutablePointer(mutating: thisPtr).move()`;

  const newOwning = `    let thisAddr = UInt(bitPattern: thisPtr)
    let argsAddr = UInt(bitPattern: argumentsPtr)
    let resAddr = UInt(bitPattern: resultPtr)

    return withGuaranteedContext(context) { (context: HostFunctionContext, runtime) in
      return JavaScriptActor.assumeIsolated {
        let thisPtr = UnsafePointer<facebook.jsi.Value>(bitPattern: thisAddr)!
        let argumentsPtr = UnsafePointer<facebook.jsi.Value>(bitPattern: argsAddr)!
        let resultPtr = UnsafeMutablePointer<facebook.jsi.Value>(bitPattern: resAddr)!
        return forwardingSwiftErrorsToJS(runtime: runtime) {
          let this = UnsafeMutablePointer(mutating: thisPtr).move()`;

  // Fix unowned call
  const oldUnowned = `    nonisolated(unsafe) let thisPtr = thisPtr
    nonisolated(unsafe) let argumentsPtr = argumentsPtr
    nonisolated(unsafe) let resultPtr = resultPtr

    // See \`withGuaranteedContext\` for why neither the context nor the runtime is retained here, and
    // why the result is written to the caller's slot instead of being returned.
    return withGuaranteedContext(context) { (context: UnownedThisHostFunctionContext, runtime) in
      return JavaScriptActor.assumeIsolated {
        return forwardingSwiftErrorsToJS(runtime: runtime) {
          let arguments = JavaScriptValuesBuffer(runtime, start: argumentsPtr, count: argumentsCount)`;

  const newUnowned = `    let thisAddr = UInt(bitPattern: thisPtr)
    let argsAddr = UInt(bitPattern: argumentsPtr)
    let resAddr = UInt(bitPattern: resultPtr)

    return withGuaranteedContext(context) { (context: UnownedThisHostFunctionContext, runtime) in
      return JavaScriptActor.assumeIsolated {
        let thisPtr = UnsafePointer<facebook.jsi.Value>(bitPattern: thisAddr)!
        let argumentsPtr = UnsafePointer<facebook.jsi.Value>(bitPattern: argsAddr)!
        let resultPtr = UnsafeMutablePointer<facebook.jsi.Value>(bitPattern: resAddr)!
        return forwardingSwiftErrorsToJS(runtime: runtime) {
          let arguments = JavaScriptValuesBuffer(runtime, start: argumentsPtr, count: argumentsCount)`;

  const normalize = str => str.replace(/\r\n/g, '\n');
  let normC = normalize(c);

  if (normC.includes(normalize(oldGetter))) {
    normC = normC.replace(normalize(oldGetter), normalize(newGetter));
    console.log('✓ Patched JavaScriptRuntime.swift (getter)');
  } else {
    console.log('⚠ Could not find oldGetter pattern');
  }

  if (normC.includes(normalize(oldOwning))) {
    normC = normC.replace(normalize(oldOwning), normalize(newOwning));
    console.log('✓ Patched JavaScriptRuntime.swift (owning call)');
  } else {
    console.log('⚠ Could not find oldOwning pattern');
  }

  if (normC.includes(normalize(oldUnowned))) {
    normC = normC.replace(normalize(oldUnowned), normalize(newUnowned));
    console.log('✓ Patched JavaScriptRuntime.swift (unowned call)');
  } else {
    console.log('⚠ Could not find oldUnowned pattern');
  }

  fs.writeFileSync(jsrPath, normC);
}
