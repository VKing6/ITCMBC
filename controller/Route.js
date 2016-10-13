Controller = {};
function Get(route, variables) {
    controller = routeSplitter(route);
    controller.get(variables);
}

function Post(route, source) {
    object = View.helpers.formToModel(source);
    controller = routeSplitter(route);
    controller.post(object, source);
}

function routeSplitter(route) {
    var routes = route.split('.');
    obj = Controller;
    for (var i = 0; i < routes.length; i++) {
        obj = obj[routes[i]];
    }
    return obj;
}