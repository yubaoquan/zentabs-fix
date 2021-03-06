'use babel'
/* global atom */

import { CompositeDisposable } from 'atom'
import ZentabsController from './controller'
import _ from 'underscore-plus'
import config from './config'

export default {
    config,
    activate() {
        this.subscriptions = new CompositeDisposable()
        this.subscriptions.add(atom.workspace.observePanes(pane => {
            const zentabController = new ZentabsController(pane)
            this.zentabsControllers = this.zentabsControllers || []
            this.zentabsControllers.push(zentabController)
            this.subscriptions.add(pane.onDidDestroy(() => {
                _.remove(this.zentabsControllers, zentabController)
            }))
            return zentabController
        }))
    },
    deactivate() {
        this.subscriptions.dispose();
        (this.zentabsControllers || []).map(controller => {
            controller.remove() && controller.destroy()
        })
    },
}
