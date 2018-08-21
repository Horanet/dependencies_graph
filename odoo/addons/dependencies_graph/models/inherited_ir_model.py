# -*- coding: utf-8 -*-

from odoo import models, fields, api


class InheritedSale(models.Model):
    """Add some data to sale orders."""

    # region Private attributes
    _inherit = 'ir.model'
    # endregion

    # region Default methods
    # endregion

    # region Fields declaration
    # endregion

    # region Fields method
    # endregion

    # region Constrains and Onchange
    # endregion

    # region CRUD (overrides)
    # endregion

    # region Actions
    @api.multi
    def action_children_dependencies_graph(self):
        """Open a new tab to visualize the dependencies graph."""
        return {
            "type": "ir.actions.act_url",
            "url": '/dependencies_graph/graph?type=module_children&module={module}'.format(module=self.name),
            "target": "new",
        }

    @api.multi
    def action_parents_dependencies_graph(self):
        """Open a new tab to visualize the dependencies graph."""
        return {
            "type": "ir.actions.act_url",
            "url": '/dependencies_graph/graph?type=module_parents&module={module}'.format(module=self.name),
            "target": "new",
        }
    # endregion

    # region Model methods
    # endregion

    pass
