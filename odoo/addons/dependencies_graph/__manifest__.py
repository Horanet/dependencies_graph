# -*- coding: utf-8 -*-
{
    'name': 'Dependencies Graph',

    'summary': """Visualize the dependencies graph for Odoo modules and models""",

    'description': 'no_warning',

    'author': 'Adrian Chang',
    'contributors': [
        'Adrian Chang',
        'Alix Casari',
    ],
    'application': True,

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/master/odoo/addons/base/module/module_data.xml
    # for the full list
    'category': 'Technical Settings',
    'version': '11.0.1.0.0',

    # any module necessary for this one to work correctly
    'depends': ['base'],

    # always loaded
    'data': [
        'views/resources.xml',
        'views/inherited_base_module.xml',
        'views/inherited_base_model.xml',
    ],
    # only loaded in demonstration mode
    'demo': [
    ],
}
