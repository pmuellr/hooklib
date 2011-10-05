//------------------------------------------------------------------------------
// licensed under the MIT License:
//    http://www.opensource.org/licenses/mit-license.php
// Copyright (c) 2011, IBM Corporation
//------------------------------------------------------------------------------

;(function() {

//------------------------------------------------------------------------------
var HookLib

if (typeof exports !== 'undefined') {
    HookLib = exports
}
else {
    HookLib = this.HookLib = {}
}

//------------------------------------------------------------------------------
var HookSites   = []
var IgnoreHooks = 0

//------------------------------------------------------------------------------
function callBeforeHooks(hookSite, receiver, args) {
    if (IgnoreHooks > 0) return

    for (var i=0; i<hookSite.hookss.length; i++) {
        var hooks = hookSite.hookss[i]

        if (hooks.before) {
            hooks.before.call(hooks, receiver, args)
        }
    }
}

//------------------------------------------------------------------------------
function callAfterHooks(hookSite, receiver, args, result) {
    if (IgnoreHooks > 0) return

    for (var i=0; i<hookSite.hookss.length; i++) {
        var hooks = hookSite.hookss[i]

        if (hooks.after) {
            hooks.after.call(hooks, receiver, args, result)
        }
    }
}

//------------------------------------------------------------------------------
function callExceptHooks(hookSite, receiver, args, e) {
    if (IgnoreHooks > 0) return

    for (var i=0; i<hookSite.hookss.length; i++) {
        var hooks = hookSite.hookss[i]

        if (hooks.except) {
            hooks.except.call(hooks, receiver, args, e)
        }
    }
}

//------------------------------------------------------------------------------
function getHookedFunction(func, hookSite) {
    var hookedFunction = function() {

        callBeforeHooks(hookSite, this, arguments)

        var result
        try {
            result = func.apply(this, arguments)
        }
        catch(e) {
            callExceptHooks(hookSite, this, arguments, e)
        }
        finally {
            callAfterHooks(hookSite, this, arguments, result)
        }

        return result
    }

    hookedFunction.hookSite = hookSite
    return hookedFunction
}

//------------------------------------------------------------------------------
function HookSite(object, property) {
    this.object   = object
    this.property = property
    this.target   = object[property]
    this.hookss   = []

    var hookedFunction = getHookedFunction(this.target, this)
    object[property] = hookedFunction
}

//------------------------------------------------------------------------------
HookSite.prototype.addHooks = function HookSite_addHooks(hooks) {
    this.hookss.push(hooks)
}

//------------------------------------------------------------------------------
HookSite.prototype.removeHooks = function HookSite_removeHooks(hooks) {
    for (var i=0; i<this.hookss.length; i++) {
        if (this.hookss[i] === hooks) {
            this.hookss.splice(i,1)
            return
        }
    }
}

//------------------------------------------------------------------------------
function getHookSite(object, property, addIfNotFound) {
    var hookSite

    for (var i=0; i<HookSites.length; i++) {
        hookSite = HookSites[i]

        if (hookSite.object   != object)   continue
        if (hookSite.property != property) continue

        return hookSite
    }

    if (!addIfNotFound) return null

    hookSite = new HookSite(object, property)

    HookSites.push(hookSite)

    return hookSite
}

//------------------------------------------------------------------------------
function HookLib_addHookSite(object, property) {
    return getHookSite(object, property, true)
}

//------------------------------------------------------------------------------
function HookLib_getHookSite(object, property) {
    return getHookSite(object, property, false)
}

//------------------------------------------------------------------------------
function HookLib_ignoreHooks(func) {
    var result

    try {
        IgnoreHooks++
        result = func.call()
    }
    finally {
        IgnoreHooks--
    }

    return result
}

//------------------------------------------------------------------------------
HookLib.addHookSite = HookLib_addHookSite
HookLib.getHookSite = HookLib_getHookSite
HookLib.ignoreHooks = HookLib_ignoreHooks


})();
