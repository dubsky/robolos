// Copyright 2008 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Unit tests for goog.functions.
 */

goog.provide('goog.functionsTest');
goog.setTestOnly('goog.functionsTest');

goog.require('goog.functions');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');


var fTrue = makeCallOrderLogger('fTrue', true);
var gFalse = makeCallOrderLogger('gFalse', false);
var hTrue = makeCallOrderLogger('hTrue', true);

var stubs = new goog.testing.PropertyReplacer();

function setUp() {
  callOrder = [];
}

function tearDown() {
  stubs.reset();
}

function testTrue() {
  assertTrue(goog.listenerObjects.TRUE());
}

function testFalse() {
  assertFalse(goog.listenerObjects.FALSE());
}

function testLock() {
  function add(var_args) {
    var result = 0;
    for (var i = 0; i < arguments.length; i++) {
      result += arguments[i];
    }
    return result;
  }

  assertEquals(6, add(1, 2, 3));
  assertEquals(0, goog.listenerObjects.lock(add)(1, 2, 3));
  assertEquals(3, goog.listenerObjects.lock(add, 2)(1, 2, 3));
  assertEquals(6, goog.partial(add, 1, 2)(3));
  assertEquals(3, goog.listenerObjects.lock(goog.partial(add, 1, 2))(3));
}

function testNth() {
  assertEquals(1, goog.listenerObjects.nth(0)(1));
  assertEquals(2, goog.listenerObjects.nth(1)(1, 2));
  assertEquals('a', goog.listenerObjects.nth(0)('a', 'b'));
  assertEquals(undefined, goog.listenerObjects.nth(0)());
  assertEquals(undefined, goog.listenerObjects.nth(1)(true));
  assertEquals(undefined, goog.listenerObjects.nth(-1)());
}

function testIdentity() {
  assertEquals(3, goog.listenerObjects.identity(3));
  assertEquals(3, goog.listenerObjects.identity(3, 4, 5, 6));
  assertEquals('Hi there', goog.listenerObjects.identity('Hi there'));
  assertEquals(null, goog.listenerObjects.identity(null));
  assertEquals(undefined, goog.listenerObjects.identity());

  var arr = [1, 'b', null];
  assertEquals(arr, goog.listenerObjects.identity(arr));
  var obj = {a: 'ay', b: 'bee', c: 'see'};
  assertEquals(obj, goog.listenerObjects.identity(obj));
}

function testConstant() {
  assertEquals(3, goog.listenerObjects.constant(3)());
  assertEquals(undefined, goog.listenerObjects.constant()());
}

function testError() {
  var f = goog.listenerObjects.error('x');
  var e = assertThrows(
      'A function created by goog.functions.error must throw an error', f);
  assertEquals('x', e.message);
}

function testFail() {
  var obj = {};
  var f = goog.listenerObjects.fail(obj);
  var e = assertThrows(
      'A function created by goog.functions.raise must throw its input', f);
  assertEquals(obj, e);
}

function testCompose() {
  var add2 = function(x) {
    return x + 2;
  };

  var doubleValue = function(x) {
    return x * 2;
  };

  assertEquals(6, goog.listenerObjects.compose(doubleValue, add2)(1));
  assertEquals(4, goog.listenerObjects.compose(add2, doubleValue)(1));
  assertEquals(6, goog.listenerObjects.compose(add2, add2, doubleValue)(1));
  assertEquals(12,
      goog.listenerObjects.compose(doubleValue, add2, add2, doubleValue)(1));
  assertUndefined(goog.listenerObjects.compose()(1));
  assertEquals(3, goog.listenerObjects.compose(add2)(1));

  var add2Numbers = function(x, y) {
    return x + y;
  };
  assertEquals(17, goog.listenerObjects.compose(add2Numbers)(10, 7));
  assertEquals(34, goog.listenerObjects.compose(doubleValue, add2Numbers)(10, 7));
}

function testAdd() {
  assertUndefined(goog.listenerObjects.sequence()());
  assertCallOrderAndReset([]);

  assert(goog.listenerObjects.sequence(fTrue)());
  assertCallOrderAndReset(['fTrue']);

  assertFalse(goog.listenerObjects.sequence(fTrue, gFalse)());
  assertCallOrderAndReset(['fTrue', 'gFalse']);

  assert(goog.listenerObjects.sequence(fTrue, gFalse, hTrue)());
  assertCallOrderAndReset(['fTrue', 'gFalse', 'hTrue']);

  assert(goog.listenerObjects.sequence(goog.listenerObjects.identity)(true));
  assertFalse(goog.listenerObjects.sequence(goog.listenerObjects.identity)(false));
}

function testAnd() {
  // the return value is unspecified for an empty and
  goog.listenerObjects.and()();
  assertCallOrderAndReset([]);

  assert(goog.listenerObjects.and(fTrue)());
  assertCallOrderAndReset(['fTrue']);

  assertFalse(goog.listenerObjects.and(fTrue, gFalse)());
  assertCallOrderAndReset(['fTrue', 'gFalse']);

  assertFalse(goog.listenerObjects.and(fTrue, gFalse, hTrue)());
  assertCallOrderAndReset(['fTrue', 'gFalse']);

  assert(goog.listenerObjects.and(goog.listenerObjects.identity)(true));
  assertFalse(goog.listenerObjects.and(goog.listenerObjects.identity)(false));
}

function testOr() {
  // the return value is unspecified for an empty or
  goog.listenerObjects.or()();
  assertCallOrderAndReset([]);

  assert(goog.listenerObjects.or(fTrue)());
  assertCallOrderAndReset(['fTrue']);

  assert(goog.listenerObjects.or(fTrue, gFalse)());
  assertCallOrderAndReset(['fTrue']);

  assert(goog.listenerObjects.or(fTrue, gFalse, hTrue)());
  assertCallOrderAndReset(['fTrue']);

  assert(goog.listenerObjects.or(goog.listenerObjects.identity)(true));
  assertFalse(goog.listenerObjects.or(goog.listenerObjects.identity)(false));
}

function testNot() {
  assertTrue(goog.listenerObjects.not(gFalse)());
  assertCallOrderAndReset(['gFalse']);

  assertTrue(goog.listenerObjects.not(goog.listenerObjects.identity)(false));
  assertFalse(goog.listenerObjects.not(goog.listenerObjects.identity)(true));

  var f = function(a, b) {
    assertEquals(1, a);
    assertEquals(2, b);
    return false;
  };

  assertTrue(goog.listenerObjects.not(f)(1, 2));
}

function testCreate(expectedArray) {
  var tempConstructor = function(a, b) {
    this.foo = a;
    this.bar = b;
  };

  var factory = goog.partial(goog.listenerObjects.create, tempConstructor, 'baz');
  var instance = factory('qux');

  assert(instance instanceof tempConstructor);
  assertEquals(instance.foo, 'baz');
  assertEquals(instance.bar, 'qux');
}

function testWithReturnValue() {
  var obj = {};
  var f = function(a, b) {
    assertEquals(obj, this);
    assertEquals(1, a);
    assertEquals(2, b);
  };
  assertTrue(goog.listenerObjects.withReturnValue(f, true).call(obj, 1, 2));
  assertFalse(goog.listenerObjects.withReturnValue(f, false).call(obj, 1, 2));
}

function testEqualTo() {
  assertTrue(goog.listenerObjects.equalTo(42)(42));
  assertFalse(goog.listenerObjects.equalTo(42)(13));
  assertFalse(goog.listenerObjects.equalTo(42)('a string'));

  assertFalse(goog.listenerObjects.equalTo(42)('42'));
  assertTrue(goog.listenerObjects.equalTo(42, true)('42'));

  assertTrue(goog.listenerObjects.equalTo(0)(0));
  assertFalse(goog.listenerObjects.equalTo(0)(''));
  assertFalse(goog.listenerObjects.equalTo(0)(1));

  assertTrue(goog.listenerObjects.equalTo(0, true)(0));
  assertTrue(goog.listenerObjects.equalTo(0, true)(''));
  assertFalse(goog.listenerObjects.equalTo(0, true)(1));
}

function makeCallOrderLogger(name, returnValue) {
  return function() {
    callOrder.push(name);
    return returnValue;
  };
}

function assertCallOrderAndReset(expectedArray) {
  assertArrayEquals(expectedArray, callOrder);
  callOrder = [];
}

function testCacheReturnValue() {
  var returnFive = function() {
    return 5;
  };

  var recordedReturnFive = goog.testing.recordFunction(returnFive);
  var cachedRecordedReturnFive = goog.listenerObjects.cacheReturnValue(
      recordedReturnFive);

  assertEquals(0, recordedReturnFive.getCallCount());
  assertEquals(5, cachedRecordedReturnFive());
  assertEquals(1, recordedReturnFive.getCallCount());
  assertEquals(5, cachedRecordedReturnFive());
  assertEquals(1, recordedReturnFive.getCallCount());
}


function testCacheReturnValueFlagEnabled() {
  var count = 0;
  var returnIncrementingInteger = function() {
    count++;
    return count;
  };

  var recordedFunction = goog.testing.recordFunction(
      returnIncrementingInteger);
  var cachedRecordedFunction = goog.listenerObjects.cacheReturnValue(
      recordedFunction);

  assertEquals(0, recordedFunction.getCallCount());
  assertEquals(1, cachedRecordedFunction());
  assertEquals(1, recordedFunction.getCallCount());
  assertEquals(1, cachedRecordedFunction());
  assertEquals(1, recordedFunction.getCallCount());
  assertEquals(1, cachedRecordedFunction());
}


function testCacheReturnValueFlagDisabled() {
  stubs.set(goog.listenerObjects, 'CACHE_RETURN_VALUE', false);

  var count = 0;
  var returnIncrementingInteger = function() {
    count++;
    return count;
  };

  var recordedFunction = goog.testing.recordFunction(
      returnIncrementingInteger);
  var cachedRecordedFunction = goog.listenerObjects.cacheReturnValue(
      recordedFunction);

  assertEquals(0, recordedFunction.getCallCount());
  assertEquals(1, cachedRecordedFunction());
  assertEquals(1, recordedFunction.getCallCount());
  assertEquals(2, cachedRecordedFunction());
  assertEquals(2, recordedFunction.getCallCount());
  assertEquals(3, cachedRecordedFunction());
}
