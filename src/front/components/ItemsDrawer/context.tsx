import {
    Dispatch,
    ReactNode,
    RefObject,
    createContext,
    useCallback,
    useContext,
    useReducer,
    useRef,
} from "react"
import { useQuery } from "urql"

import ItemsDrawer from "."
import { graphql } from "../../gql"
import { setItemVisible } from "../../routes/Items"
import { ItemFromQuery } from "../../types"

export const itemsQueryDocument = graphql(`
    query Items {
        item {
            id
            known
            edge
            forge
            grail
            heart
            knock
            lantern
            moon
            moth
            nectar
            rose
            scale
            sky
            winter
            aspects {
                id
            }
        }
    }
`)

type StringSetAction =
    | { type: "clear" }
    | { type: "toggle"; id: string; selected: boolean }

function reduceStringSet(
    state: Set<string>,
    action: StringSetAction,
): Set<string> {
    switch (action.type) {
        case "clear": {
            return new Set()
        }
        case "toggle": {
            const nextState = new Set(state)
            if (action.selected) nextState.add(action.id)
            else nextState.delete(action.id)
            return nextState
        }
    }
}

interface ItemsDrawerContextProps {
    items: ItemFromQuery[]
    itemRefs: RefObject<Map<string, RefObject<HTMLDivElement>>>
    selected: Set<string>
    dispatch: Dispatch<StringSetAction>
}

const ItemsDrawerContext = createContext<ItemsDrawerContextProps>({
    items: [],
    // eslint-disable-next-line unicorn/no-null
    itemRefs: { current: null },
    selected: new Set(),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    dispatch() {},
})

export const useItemsDrawer = (): ItemsDrawerContextProps => {
    return useContext(ItemsDrawerContext)
}

interface ItemsDrawerContextProviderProps {
    children: ReactNode
}

export const ItemsDrawerContextProvider = ({
    children,
}: ItemsDrawerContextProviderProps) => {
    const [{ data }] = useQuery({ query: itemsQueryDocument })
    const items = data!.item.map((item) => setItemVisible(item, true))
    const [selected, dispatch] = useReducer(reduceStringSet, new Set<string>())

    // all possible item refs have a key, even if they’re filtered out
    const itemRefs = useRef(
        new Map<string, RefObject<HTMLDivElement>>(
            // eslint-disable-next-line unicorn/no-null
            data!.item.map(({ id }) => [id, { current: null }]),
        ),
    )
    const clearSelected = useCallback(() => dispatch({ type: "clear" }), [])

    return (
        <ItemsDrawerContext.Provider
            value={{ items: data!.item, itemRefs, selected, dispatch }}
        >
            {children}
            <ItemsDrawer
                items={items}
                itemRefs={itemRefs}
                selected={selected}
                onClear={clearSelected}
            />
        </ItemsDrawerContext.Provider>
    )
}