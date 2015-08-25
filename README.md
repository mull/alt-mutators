# Introduction
`alt-mutators` are a simple way to define mutating operations for an API, tied to your alt store. Their interface bear a striking similarity to [alt's data async sources](http://alt.js.org/docs/async/), in fact the code is based based on just that.

## ALPHA SOFTWARE
Please note that this is an early version of this concept. No stability guaranteed.

## Install
`npm install --save-dev alt-mutators`

## Usage
Add the `registerMutator` function by decorating your store with the `@mutator` function. Then pass it the mutator definition in your constructor:

```js
import mutator from "alt-mutators";

const mutatorDefinition = {
    createTodo: {
        // Argument is always an object. State is added by the plugin.
        write({state, data}) {
            // This method must return a promise.
            return apiMethod.post("/todos", data);
        },

        writing: TodoActions.writingTodo,
        success: TodoActions.wroteTodo,
        error:   TodoActions.failedWritingTodo,
    }
};

@mutator
class TodoStore
    constructor() {
        this.registerMutator(mutatorDefinition);
    }

    onWritingTodo({data}) {

    }

    onWroteTodo({data}) {

    }

    onFailedWritingTodo({data}) {

    }
}

export default alt.createStore(TodoStore);
```

This adds a public method to your alt store called `createTodo`. Usage from a view might look something like this:

```js
import TodoStore from "./TodoStore";

class SomeView extends React.Component {
    _onSaveTodo(data) {
        TodoStore
            .createTodo(data)
            .then(...)
            .catch(...)
    }
}
```


## Feedback
Please leave feedback in an issue or (on twitter.)[twitter.com/mullsork]



