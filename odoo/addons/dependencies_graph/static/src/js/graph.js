odoo.define('dependencies_graph.graph', function (require) {
    "use strict";

    var w = window['dependencies_graph'] = {};
    var session = require('web.session');

    var selector = '#graph';
    var options_modules = {
        configure: {
            enabled: true,
            filter: 'physics',
        },
        nodes: {
            shape: 'box',
            margin: 10,
        },
    };

    var options_models = {
        configure: {
            enabled: true,
            filter: 'physics',
        },
        nodes: {
            shape: 'box',
            margin: 10,
            font: {
                face: 'monospace',
                align: 'left',
                multi: true
            }
        },
        physics: {
            barnesHut: {
                gravitationalConstant: -32592,
                centralGravity: 0,
                springLength: 700,
                springConstant: 0.03
            },
            maxVelocity: 51,
            minVelocity: 0.75,
        }
    };

    w.generate = function () {
        var type = $('#type').val();
        var module = $('#module').val();
        var model = $('#model').val();
        var number = $('#iterations').val();

        $('#settings').empty();

        window.dependencies_graph[type](module, model, number).done(function (network) {
            console.log('generated', module);
        });
    };

    w.type_changed = function () {
        var type = $('#type').val();
        var div_module = $('#module');
        var div_model = $('#model');
        var div_iterations = $('#iterations');

        switch (type) {
            case 'module_children':
                div_module.prop('disabled', false);
                div_model.prop('disabled', true);
                div_iterations.prop('disabled', true);
                break;
            case 'module_parents':
                div_module.prop('disabled', false);
                div_model.prop('disabled', true);
                div_iterations.prop('disabled', true);
                break;
            case 'model_graph':
                div_module.prop('disabled', true);
                div_model.prop('disabled', false);
                div_iterations.prop('disabled', false);
                break;
        }
    };

    w.module_children = function (module, model, number) {
        var promise = $.Deferred();
        session.rpc('/dependencies_graph/module/' + module).done(function (result) {
            var deps = JSON.parse(result);
            var nodes = new vis.DataSet([]);
            var edges = new vis.DataSet([]);

            var modules = [module];
            while (modules.length > 0) {
                var m = modules.shift();
                var children = _.filter(_.keys(deps), function (k) {
                    return _.contains(deps[k]['depends'], m);
                });
                modules = _.union(modules, children);

                nodes.update({id: m, label: m, color: deps[m]['state'] == 'installed' ? 'lime' : {background:'white',border:'red'}});
                _.each(children, function (child) {
                    if (!nodes.get(child)) {
                        nodes.update({id: child, label: child, color: deps[child]['state'] == 'installed' ? 'lime' : {background:'white',border:'red'}});
                        edges.update({from: m, to: child, arrows: 'to'})
                    }
                })
            }

            // create a network
            var container = $(selector)[0];
            var data = {
                nodes: nodes,
                edges: edges
            };
            options_modules['configure']['container'] = $('#settings')[0];
            var network = new vis.Network(container, data, options_modules);

            promise.resolve(network);
        });
        return promise;
    };

    w.module_parents = function (module, model, number) {
        var promise = $.Deferred();
        session.rpc('/dependencies_graph/module/' + module).done(function (result) {
            var deps = JSON.parse(result);
            var nodes = new vis.DataSet([]);
            var edges = new vis.DataSet([]);

            var modules = [module];
            while (modules.length > 0) {
                var m = modules.shift();
                var parents = deps[m]['depends'];
                modules = _.union(modules, parents);

                nodes.update({id: m, label: m, color: deps[m]['state'] == 'installed' ? 'lime' : {background:'white',border:'red'}});
                _.each(parents, function (p) {
                    if (!nodes.get(p)) {
                        nodes.update({id: p, label: p, color: deps[p]['state'] == 'installed' ? 'lime' : {background:'white',border:'red'}});
                        edges.update({from: p, to: m, arrows: 'to'})
                    }
                })
            }

            // create a network
            var container = $(selector)[0];
            var data = {
                nodes: nodes,
                edges: edges
            };
            options_modules['configure']['container'] = $('#settings')[0];
            var network = new vis.Network(container, data, options_modules);

            promise.resolve(network);
        });
        return promise;
    };

    w.model_graph = function (module, modele, number) {
        var promise = $.Deferred();
        var model = modele.replace("_", ".")

        session.rpc('/dependencies_graph/model/').done(function (result) {
            var deps = JSON.parse(result);
            var nodes = new vis.DataSet([]);
            var edges = new vis.DataSet([]);
            var models = [model];
            var treated_models = [];
            var i=0;

            if (!deps[model]) {
                alert('Model does not exists.');
                return
            }

            while (models.length > 0 && i < number) {
                var new_models = [];

                models.forEach(function(m) {
                    var relations = deps[m]['depends'];
                    new_models = _.union(new_models, relations);

                    nodes.update({
                        id: m,
                        label: deps[m]['label'],
                        font: {'face': 'monospace', 'align': 'left', 'multi': true}
                    });
                    _.each(relations, function (p) {
                        if (!nodes.get(p)) {
                            nodes.update({
                                id: p,
                                label: deps[p]['label'],
                            });
                        }
                        var id_edge = p + '_' + m;
                        if (!edges.get(id_edge)) {
                            var id_edge_inv = m + '_' + p;
                            if (!edges.get(id_edge_inv)) {
                                edges.update({id: id_edge, from: p, to: m, arrows: 'from'})
                            } else {
                                edges.remove(edges.get(id_edge_inv))
                                edges.update({id: id_edge, from: p, to: m, arrows: 'to, from'})
                            }
                        }
                    })
                });
                treated_models = _.union(treated_models, models);
                models = _.difference(new_models, treated_models);

                i++;
            }

            nodes.update({id: model, color: 'red'});

            // create a network
            var container = $(selector)[0];
            var data = {
                nodes: nodes,
                edges: edges
            };
            options_models['configure']['container'] = $('#settings')[0];
            var network = new vis.Network(container, data, options_models);

            // On ajoute une fonction sur les noeuds permettant d'en enlever
            nodes.deleteNodeAndEdges = function(node_id) {
                try {
                    this.remove({id: node_id});

                    edges.forEach(function(edge){
                        if (edge.from == node_id || edge.to == node_id) {
                            edges.remove({id: edge.id});
                        }
                    });
                }
                catch (err) {
                    alert(err);
                }
            };

            // Permettre la suppression de noeuds au double clic et des noeuds orphelins résultants
            network.on( 'doubleClick', function(properties) {
                var ids = properties.nodes;

                nodes.deleteNodeAndEdges(ids);

                nodes.forEach(function(node){
                    var node_edges = edges.get({
                        filter: function (edge) {
                            return edge.from == node.id || edge.to == node.id;
                        }
                    });

                    if (node_edges.length == 0) {
                        nodes.deleteNodeAndEdges(node.id);
                    }
                });
            });

            promise.resolve(network);
        });
        return promise;
    };

    window.onload = function() {
        var params = (new URL(window.location.href)).searchParams

        // On remplit le formulaire avec les données de l'url
        params.forEach((x, y) => document.getElementById(y).value = x)

        // On appuie sur le bouton pour générer le graph si le module est fourni
        if (params.has('module') || params.has('model')) {
            document.getElementById("btn_generate").click();
        }
    };
});
