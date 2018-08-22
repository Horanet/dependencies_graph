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
    def action_dependencies_graph(self):
        """Open a new tab to visualize the dependencies graph."""
        return {
            "type": "ir.actions.act_url",
            "url": '/dependencies_graph/graph?type=model_graph&model={model}&iterations=2'.format(model=self.model),
            "target": "new",
        }
    # endregion

    # region Model methods
    # endregion

    pass
