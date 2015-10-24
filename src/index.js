import * as fn from 'alt/utils/functions'

function registerMutator(mutatorDef) {
  let loadCounter = 0

  const asyncMethods = fn.isFunction(mutatorDef)
    ? mutatorDef(this.alt)
    : mutatorDef

  const toExport = Object.keys(asyncMethods).reduce((publicMethods, methodName) => {
    const desc = asyncMethods[methodName]
    const spec = fn.isFunction(desc) ? desc(this) : desc

    const validHandlers = ['success', 'error', 'writing']
    validHandlers.forEach((handler) => {
      if (spec[handler] && !spec[handler].id) {
        throw new Error(`${handler} handler must be an action function`)
      }
    })

    publicMethods[methodName] = (args) => {
      if (args !== Object(args)) {
        throw new Error(`${methodName} only accepts an object as its sole argument`)
      }

      const makeActionHandler = (action, isError) => {
        return (x) => {
          const fire = () => {
            loadCounter -= 1
            args.result = x
            action(args)
            if (isError) throw x
          }
          return this.alt.trapAsync ? (() => fire()) : fire()
        }
      }

      loadCounter += 1
      spec.writing(args)

      const currentState = this.getInstance().getState()
      args.state = currentState

      return spec.write(args).then(
        makeActionHandler(spec.success),
        makeActionHandler(spec.error, 1)
      )
    }

    return publicMethods
  }, {})

  this.exportPublicMethods(toExport)
  this.exportPublicMethods({
    isLoading: () => loadCounter > 0
  })
}

export default function Mutator(StoreModel) {
  StoreModel.prototype.registerMutator = registerMutator
  return StoreModel
}
