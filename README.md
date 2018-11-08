# Odoo Dependencies Graph

This tool is aimed to help software developers to get a better understanding of the dependencies among modules and models in an Odoo application.

We use the library [vis.js](http://visjs.org/) to render the graph.

## Types of graph

1. Odoo Module Children

    Given an Odoo module it shows every module that depends of him directly or indirectly, installed or not.
    
2. Odoo Module Parents

    Given an Odoo module it shows every module in which the module depends on. These are every modules that needs to be installed before him.

3. Odoo Model Graph

    Given an Odoo model it shows models relations depending on recursive iteration counter.

## Installation command

`pip install git+https://github.com/Horanet/dependencies_graph.git@10.0#egg=odoo10_addon_dependencies_graph`
