'use babel'
/* global atom */

import { CompositeDisposable } from 'atom'
import _ from 'underscore-plus'
import { $, View } from 'atom-space-pen-views'

export default class ZentabsController extends View {
    constructor(pane) {
        super()
        this.pane = pane
        this.subscriptions = new CompositeDisposable()
        this.subscriptions.add(atom.commands.add('atom-workspace', 'zentabs-fix:cleanup', (function(_this) {
            return function() {
                return _this.closeOverflowingTabs()
            }
        }(this))))
        this.subscriptions.add(
            atom.commands.add('atom-workspace', 'zentabs-fix:pintab', this.pinTab)
        )
        this.subscriptions.add(
            atom.commands.add('atom-workspace', 'zentabs-fix:unpintab', this.unpinTab)
        )
        this.subscriptions.add(
            atom.commands.add('atom-workspace', 'zentabs-fix:toggletab', this.toggleTab)
        )
        this.items = []
        this.pinnedItems = []

        this.pane.getItems().forEach(item => {
            this.pushItem(item)
        })
        this.subscriptions.add(this.pane.onDidDestroy(pane => {
            if (pane === this.pane) {
                return this.unsubscribe()
            }
        }))
        this.subscriptions.add(this.pane.onDidAddItem(_arg => {
            const item = _arg.item
            this.pushItem(item)
            if (!atom.config.get('zentabs-fix.manualMode')) {
                setTimeout(() => {
                    this.closeOverflowingTabs(item)
                }, 0)
            }
            return true
        }))

        this.subscriptions.add(this.pane.onDidRemoveItem(_arg => {
            const item = _arg.item
            _.remove(this.pinnedItems, item)
            _.remove(this.items, item)
            return true
        }))
        this.subscriptions.add(this.pane.onDidChangeActiveItem(() => {
            this.updateActiveTab()
            return true
        }))
        this.updateActiveTab()
        if (!atom.config.get('zentabs-fix.manualMode')) {
            return this.closeOverflowingTabs()
        }
    }
    static content() {
        return this.span('')
    }
    destroy() {
        return this.subscriptions.dispose()
    }
    pushItem(item) {
        if (!this.pinnedItems.includes(item)) {
            return this.items.push(item)
        }
    }
    updateActiveTab() {
        const item = this.pane.getActiveItem()
        if (!item) {
            return
        }
        if (this.pinnedItems.indexOf(item) > -1) {
            return
        }
        _.remove(this.items, item)
        return this.items.push(item)
    }
    getRepositories() {
        return atom.project.getRepositories()
    }
    closeOverflowingTabs(newItem) {
        const maxTabs = atom.config.get('zentabs-fix.maximumOpenedTabs')
        const neverCloseUnsaved = atom.config.get('zentabs-fix.neverCloseUnsaved')
        const neverCloseDirty = atom.config.get('zentabs-fix.neverCloseDirty')
        const neverCloseNew = atom.config.get('zentabs-fix.neverCloseNew')
        const tmpItems = this.items.slice(0)
        let itemAmount = this.items.length
        tmpItems.forEach(olderItem => {
            let preventBecauseDirty
            let preventBecauseNew
            if (itemAmount <= maxTabs || olderItem.buffer == null) {
                return
            }
            const buffer = olderItem.buffer
            if (buffer.isModified() && neverCloseUnsaved) {
                return
            }
            if (buffer.file == null || buffer.file.path == null) {
                return
            }
            preventBecauseDirty = false
            preventBecauseNew = false
            const itemPath = buffer.file.path
            if (!itemPath) {
                return
            }
            this.getRepositories()
                .filter(repo => !!repo)
                .forEach(repo => {
                    preventBecauseDirty = preventBecauseDirty
                        || repo.isPathModified(itemPath) && neverCloseDirty
                    preventBecauseNew = preventBecauseNew
                        || repo.isPathNew(itemPath) && neverCloseNew
                })
            if (preventBecauseNew || preventBecauseDirty) {
                return
            }
            this.pane.destroyItem(olderItem)
            itemAmount--
        })
    }

    pinTab() {
        const tab = $('.tab.right-clicked, .tab.active').first()
        if (tab.size() === 0) {
            return
        }
        const view = atom.views.getView(tab)
        const item = view.item
        _.remove(this.items, item)
        if (!(this.pinnedItems.indexOf(item) > -1)) {
            this.pinnedItems.push(item)
        }
        return tab.addClass('pinned')
    }

    unpinTab(event) {
        const tab = $('.tab.right-clicked, .tab.active').first()
        if (tab.size() === 0) {
            return
        }
        const view = atom.views.getView(tab)
        const item = view.item
        _.remove(this.pinnedItems, item)
        this.pushItem(item)
        tab.removeClass('pinned')
        return this.closeOverflowingTabs()
    }

    toggleTab() {
        const tab = $('.tab.active')
        if (!tab) {
            return
        }
        const view = atom.views.getView(tab)
        const item = view.item
        if (tab.hasClass('pinned')) {
            this.pushItem(item)
            tab.removeClass('pinned')
            return this.closeOverflowingTabs()
        } else {
            _.remove(this.items, item)
            if (!(this.pinnedItems.indexOf(item) > -1)) {
                this.pinnedItems.push(item)
            }
            return tab.addClass('pinned')
        }
    }
}
