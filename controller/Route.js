Controller = {};
function Get(route, variables) {
    controller = routeSplitter(route);
    controller.get(variables);
    Controller.Firemission.sidebar.get();
}

function Post(route, source) {
    object = View.helpers.formToModel(source);
    controller = routeSplitter(route);
    controller.post(object, source);
    Controller.Firemission.sidebar.get();
}

function Delete(route, id) {
    controller = routeSplitter(route);
    controller.delete(id);
}

function routeSplitter(route) {
    var routes = route.split('.');
    obj = Controller;
    for (var i = 0; i < routes.length; i++) {
        obj = obj[routes[i]];
    }
    return obj;
}