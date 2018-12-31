(function() {
    let controllers = {};

    let addController = function(name, constructor) {

        // Almacen constructor controllers
        controllers[name] = {
            factory: constructor,
            instances: []
        }

        // Buscando elementos usando controllers
        let element = document.querySelector('[ng-controller=' + name + ' ]');
        if (!element) {
            return; // Ningún elemento usando este controlador
        }

        // Crea una instancia y guardala
        let ctrl = new controllers[name].factory();
        controllers[name].instances.push(ctrl);

        // Obtener elementos vinculados a las propiedades
        let bindings = {};

        Array.prototype.slice.call(element.querySelectorAll('[ng-bind]'))
            .map(function(element) {
                let boundValue = element.getAttribute('ng-bind');

                if (!bindings[boundValue]) {
                    bindings[boundValue] = {
                        boundValue: boundValue,
                        elements: []
                    };
                }

                // Contiene todas las propiedades para vincularse con su valor actual y
                // todos los elementos DOM que vinculan esta propiedad
                bindings[boundValue].elements.push(element);
            });

        // Detectar actualizaciones de código con un Proxy
        // Proxy configurado solo para las propiedades enlazadas al controller
        // Actualizar el DOM
        // Note: ctrl es la instancia del controller
        let proxy = new Proxy(ctrl, {
            set: function(target, prop, value) {
                let bind = bindings[prop];

                if (bind) {
                    bind.elements.forEach(function(element) {
                        element.value = value;
                        element.setAttribute('value', value);
                    });
                }

                return Reflect.set(target, prop, value);
            }
        });

        // Escuchar actualizacion de elementos del DOM para establecer la propiedad del controlador
        // Todos los elementos vinculados a la misma propiedad se actualizaran automaticamente
        // gracias al Proxy
        Object.keys(bindings).forEach(function(boundValue) {
            let bind = bindings[boundValue];
            bind.elements.forEach(function(element) {
                element.addEventListener('input', function(event) {
                    proxy[bind.boundValue] = event.target.value;
                });
            });
        });

        // Rellenar el proxy con las propiedades del ctrl
        // y retornar proxy, no el ctrl
        Object.assign(proxy, ctrl);
        return proxy;
    };

    // Exportar el framework
    this.angular = {
        controller: addController
    };
})();

// Usar codigo
function InputController() {
    this.message = 'Hello World!';
}

let myInputController = angular.controller('InputController', InputController);

function onButtonClick() {
    myInputController.message = 'Clicked!';
}