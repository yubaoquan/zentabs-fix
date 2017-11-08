'use babel'
/* global atom */

import { CompositeDisposable } from 'atom'
import ZentabsController from './controller'
import _ from 'underscore-plus'
import config from './config'
import { name as packageName } from '../package.json'

const configCache = {}
Object.keys(config).forEach(key => {
    configCache[key] = config[key].default
})


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
        this.observeConfig()
    },
    observeConfig() {
        Object.keys(this.config).forEach(key => {
            atom.config.observe(`${packageName}.${key}`, value => {
                configCache[key] = value
            })
        })
    },
    deactivate() {
        this.subscriptions.dispose();
        (this.zentabsControllers || []).map(controller => {
            controller.remove() && controller.destroy()
        })
    },
}
