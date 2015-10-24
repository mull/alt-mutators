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


### Using the result
The Promise returned by the mutator will resolve with 

1. The object send to the mutator's write function
2. The result of the promise that the mutator returned

So for example if this is the call to a mutator

```js
TodoStore.createTodo({todo: {title: "Write better docs"}});
```

Then the mutator will receive

```js
write({state, todo}) {
    return methodReturningAPromise(todo);
}
```

Then the promise returned from calling the mutator method on the store will resolve to

```js
{
    state: {todos: []}                   // same object the mutator received,
    todo:  {title: "Write better docs"}  // same object the mutator received,
    result: {
        id: 1, 
        title: "Write better docs"
    } // whatever the promise returned by the mutator resolves to
}
```

With that in mind you can comfortably listen to the promise after calling your store and (preferably) query your store:

```js
TodoStore
    .createTodo(data)
    .then((data) => {
        const createdTodo = data.result;
        console.log("The id of the todo is: ", todo.id);
    });
```

## Feedback
Please leave feedback in an issue or (on twitter to @mullsork.)[twitter.com/mullsork]



