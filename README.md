HookLib
=======

A JavaScript library that allows you to "hook" other functions.

installation
-------------

HookLib can be installed as an NPM module, or used in a browser.  To use in
a browser, simply include the `hooklib.js` script file in your HTML page.
The functions exported by the module are available in the global variable
named `HookLib`.

exported module functions
=========================

`addHookSite(object, property)`
-------------------------------

Adds a hook site for the function available at `object[property]`.  The
hook site is returned as an `HookSite` object.  Once called, the specified
function is "hooked".  If the function is already hooked, the already
existing hook site is returned.

`getHookSite(object, property)`
-------------------------------

Returns a `HookSite` object for the function available at `object[property]`,
if a hook site has been added.  If no hook site has been added to the function,
returns `null`.

`ignoreHooks(func)`
-------------------

Runs the specified function disabling all hooks for the duration of the
function.

HookSite objects
----------------

The object returned from the `addHookSite()` and `getHookSite()` functions
is a `HookSite` object.  These objects have the following methods:

`HookSite.addHooks(hooks)`
--------------------------

Adds the specified hooks to the hook site.  The `hooks` parameter should be
an object with the following properties:

* `before` - a function called before the hooked function is called
* `after` - a function called after the hooked function is called
* `except` - a function called if the hooked function throws an exception
* `userData` - a place to store your goodies

You do not need to set all the properties, if you don't need thm.

The `before` function is called as follows:

    before.call(hooks, receiver, args)

The `after` function is called as follows:

    after.call(hooks, receiver, args, result)

The `except` function is called as follows:

    except.call(hooks, receiver, args, e)

The parameters to these functions:

* `this` - for each function invocation, `this` will be set to the `hooks` object.
* `receiver` - the `this` value the hooked function was invoked with
* `args` - the `Arguments` object the hooked function was invoked with
* `result` - the result of the hooked function invocation
* `e` - the exception thrown during the hooked function invocation

`HookSite.removeHooks(hooks)`
-----------------------------

Removes the specified hooks to the hook site.  The `hooks` parameter must be
the same object previously passed to the `addHooks()` function.


Example
=======

    //------------------------------------------------
    function before(receiver, args) {
        console.log("--> document.createElement(" + args[0] + ")")
        this.userData.invocations++
    }

    function after(receiver, args, result) {
        console.log("<-- document.createElement(" + args[0] + "): " + result)
    }

    function except(receiver, args, e) {
        this.userData.exceptions++
    }

    var userData = {
        invocations: 0,
        exceptions:  0,
    }

    //------------------------------------------------
    var hookSite = HookLib.addHookSite(document, "createElement")

    hookSite.addHooks({
        before:   before,
        after:    after,
        except:   except,
        userData: userData
    })

    //------------------------------------------------
    function windowResized() {
        console.log("window resized")
    }

    //------------------------------------------------
    document.createElement("b")
    document.createElement(null)

    HookLib.ignoreHooks(function() {
        document.createElement("a")
    })

    document.createElement("i")

    console.log("invocations: " + userData.invocations)
    console.log("exceptions:  " + userData.exceptions)

This will produce the following output:

    --> document.createElement(b)
    <-- document.createElement(b): [object HTMLElement]
    --> document.createElement(null)
    <-- document.createElement(null): undefined
    --> document.createElement(i)
    <-- document.createElement(i): [object HTMLElement]
    invocations: 3
    exceptions:  1

etc
===

Some ideas from ["AOP aspect of JavaScript with Dojo"](http://lazutkin.com/blog/2008/may/18/aop-aspect-javascript-dojo/)
by Eugene Lazutkin.