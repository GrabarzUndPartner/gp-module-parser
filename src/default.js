"use strict";

export default {
    packages: null,
    parse: function(node, packages) {
        this.packages = packages || this.packages;
        if (this.packages) {
            var selector = '.controller[data-controller]';
            node = node || document.documentElement;
            var nodes = Array.prototype.slice.call(node.querySelectorAll(selector));
            if (matches(node, selector)) {
                nodes.push(node);
            }
            return render(this, selector, nodes);
        } else {
            console.error('parser', 'packages undefined');
        }
        return null;
    }
};

function render(scope, selector, nodes) {
    // reverse the initializing order to initialize inner atoms before outer atoms
    Array.prototype.reverse.call(nodes);
    return new Promise(function(fulfill, reject) {
        nodes.forEach(function(node) {
            try {
                initController(scope, selector, node);
            } catch (e) {
                reject(e);
            }
        });
        fulfill(true);
    });
}

function initController(scope, selector, node) {
    if (!node.init) {
        node.init = true;
        var targetNode = null;
        var targetSelector = node.dataset.target;
        if (targetSelector) {
            targetNode = document.querySelector(targetSelector);
            if (matches(targetNode, selector)) {
                initController(scope, selector, targetNode);
            }
        }
        var controllerClass = scope.packages.find(function(controller) {
            return controller.name === node.getAttribute('data-controller');
        });

        if (controllerClass && controllerClass.controller) {
            if (controllerClass.chunk) {
                controllerClass.controller(function(controller) {
                    new controller({
                        el: node,
                        target: targetNode
                    });
                });
            } else {
                new controllerClass.controller({
                    el: node,
                    target: targetNode
                });
            }
        }
    }
}

function matches(el, selector) {
    return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector);
}
