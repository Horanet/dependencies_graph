# -*- coding: utf-8 -*-
import json
from odoo import http

import odoo
import odoo.modules.db
import odoo.modules.graph
from odoo.modules.registry import Registry


class DependenciesGraph(http.Controller):
    @http.route('/dependencies_graph/module/<string:module_name>', type='json', auth="none")
    def get_graph(self, module_name):
        dbname = odoo.tools.config['db_name']
        cr = Registry.new(dbname)._db.cursor()
        graph = odoo.modules.graph.Graph()

        cr.execute("SELECT name from ir_module_module")
        module_list = [name for (name,) in cr.fetchall() if name not in graph]

        graph.add_modules(cr, module_list)
        if module_name is graph:
            graph = graph[module_name]

        deps = {}
        for key, value in graph.iteritems():
            deps[key] = {
                'depends': value.info['depends'],
                'state': value.state,
            }

        return json.dumps(deps)

    @http.route('/dependencies_graph/model/', type='json', auth="none")
    def get_model_graph(self):
        dbname = odoo.tools.config['db_name']
        cr = Registry.new(dbname)._db.cursor()
        graph = odoo.modules.graph.Graph()

        cr.execute("SELECT distinct(model) from ir_model_fields")
        model_list = [model for (model,) in cr.fetchall()]

        deps = {}
        for model in model_list:
            print(model)
            cr.execute("SELECT name, ttype, relation from ir_model_fields where model = %s order by name", (model,))
            fields_list = [(name, ttype, relation) for (name, ttype, relation,) in cr.fetchall()]

            label = '<b>' + model.upper() + '</b>'
            depends = []
            for field in fields_list:
                field_name = field[0]
                field_type = field[1]
                relation = field[2]
                if field_name in ['id', 'create_uid', 'create_date', 'write_uid', 'write_date', '__last_update']:
                    continue

                if field_name.startswith('message_'):
                    continue

                if model not in ['res.partner', 'res.users']:
                    label += '\n{name} ({type})'.format(name=field_name, type=field_type)

                    if relation and relation != model:
                        print(model + '=>' + relation)
                        depends.append(relation)

            if model in ['res.partner', 'res.users']:
                label += '\n[...]'

            deps.update({
                model: {
                    'label': label,
                    'depends': depends,
                }
            })

        return json.dumps(deps)

    @http.route('/dependencies_graph/graph/', auth='public', website=True)
    def index(self, **kw):
        return http.request.render('dependencies_graph.graph')
