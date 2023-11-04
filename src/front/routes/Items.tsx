import {
    Dispatch,
    ReactNode,
    RefObject,
    createContext,
    forwardRef,
    memo,
    useCallback,
    useContext,
    useMemo,
    useReducer,
    useRef,
} from "react"
import { useQuery } from "urql"

import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemButton, {
    ListItemButtonProps,
} from "@mui/material/ListItemButton"
import ListItemText from "@mui/material/ListItemText"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"

import ItemsDrawer from "../components/ItemsDrawer"
import { graphql } from "../gql"
import { AspectIconGroup } from "../routes/Aspects"
import { PrincipleIcon } from "../routes/Principles"
import {
    ItemFromQuery,
    PRINCIPLES,
    Principle,
    PrincipleString,
    VisibleItem,
} from "../types"

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

type AspectFromQuery = ItemFromQuery["aspects"][number]

interface ItemsProps {
    filters?: {
        known?: boolean
        aspects?: AspectFromQuery[]
        principles?: Principle[]
    }
}

function setVisible(
    item: ItemFromQuery,
    visible: boolean,
    index = 0,
): VisibleItem {
    return { ...item, isVisible: visible, index: index }
}

function filterItems(
    state: ItemFromQuery[],
    filters: ItemsProps["filters"] = {},
): VisibleItem[] {
    let filteredState = state
    // now everything is visible
    if (filters.known) {
        filteredState = filteredState.filter(({ known }) => known)
    }
    // now, if we filtered by known, the unknown items are no longer visible
    if (filters.principles) {
        filteredState = filters.principles
            .map(({ id }) => id as PrincipleString)
            .flatMap((principle) =>
                filteredState
                    .filter((item) => item[principle] !== null)
                    // NB: this doesn't work with principles.length > 1
                    .toSorted(
                        (a, b) => (b[principle] ?? 0) - (a[principle] ?? 0),
                    ),
            )
    }
    // now, if we filtered by principles, the items lacking one or more of the principles are no longer visible
    if (filters.aspects) {
        const aspects = new Set(filters.aspects.map((aspect) => aspect.id))
        filteredState = filteredState.filter((item) =>
            item.aspects.some(({ id }) => aspects.has(id)),
        )
    }
    // now, if we filtered by aspects, the items lacking one or more of the aspects are no longer visible
    // now we apply isVisible to all items which were filtered
    const filteredItems = filteredState.map(({ id }) => id)
    const filteredItemsSet = new Set(filteredItems)
    return state.map((item) =>
        setVisible(
            item,
            filteredItemsSet.has(item.id),
            filteredItems.indexOf(item.id),
        ),
    )
}

const ItemPrincipleValue = ({
    principle,
    value,
}: {
    principle: PrincipleString
    value: number
}) => {
    return (
        <>
            <PrincipleIcon principle={principle} />
            <Typography
                variant="h6"
                sx={{
                    paddingInline: 1,
                }}
            >
                {value}
            </Typography>
        </>
    )
}

const ItemValues = ({ aspects, ...item }: ItemFromQuery) => (
    <Stack direction="row" alignItems="center">
        {PRINCIPLES.filter((principle) => item[principle]).map((principle) => (
            <ItemPrincipleValue
                key={principle}
                principle={principle}
                value={item[principle]!}
            />
        ))}
        <AspectIconGroup aspects={aspects} />
    </Stack>
)

export interface ItemProps extends ItemFromQuery {
    onToggleSelect?(id: string, selected: boolean): void
    sx?: ListItemButtonProps["sx"] | undefined
}

const Item = forwardRef<HTMLDivElement, ItemProps>(function Item(
    { onToggleSelect, sx, ...item },
    ref,
) {
    const { selected, dispatch } = useDrawerContext()
    const handleToggleSelect = useCallback(() => {
        dispatch({
            type: "toggle",
            id: item.id,
            selected: !selected.has(item.id),
        })
        onToggleSelect?.(item.id, !selected)
    }, [dispatch, item.id, onToggleSelect, selected])
    return (
        <ListItem disablePadding>
            <ListItemButton
                ref={ref}
                selected={selected.has(item.id)}
                onClick={handleToggleSelect}
                sx={sx}
            >
                <ListItemText primary={item.id} />
                <ItemValues {...item} />
            </ListItemButton>
        </ListItem>
    )
})

interface ItemsListProps {
    items: VisibleItem[]
    itemRefs: RefObject<Map<string, RefObject<HTMLDivElement>>>
}

// This list is long, use memo to prevent rerendering
const ItemsList = memo(function ItemsList({ items, itemRefs }: ItemsListProps) {
    return (
        <List
            sx={{
                maxWidth: "sm",
                marginInline: "auto",
            }}
        >
            {items
                .toSorted((a, b) => a.index - b.index)
                .map((item) => (
                    <Item
                        key={item.id}
                        ref={itemRefs.current?.get(item.id)}
                        {...item}
                    />
                ))}
        </List>
    )
})

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

interface DrawerContextProps {
    items: ItemFromQuery[]
    itemRefs: RefObject<Map<string, RefObject<HTMLDivElement>>>
    selected: Set<string>
    dispatch: Dispatch<StringSetAction>
}

const DrawerContext = createContext<DrawerContextProps>({
    items: [],
    // eslint-disable-next-line unicorn/no-null
    itemRefs: { current: null },
    selected: new Set(),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    dispatch() {},
})

export const useDrawerContext = (): DrawerContextProps => {
    return useContext(DrawerContext)
}

interface DrawerContextProviderProps {
    children: ReactNode
}

export const DrawerContextProvider = ({
    children,
}: DrawerContextProviderProps) => {
    const [{ data }] = useQuery({ query: itemsQueryDocument })
    const items = data!.item.map((item) => setVisible(item, true))
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
        <DrawerContext.Provider
            value={{ items: data!.item, itemRefs, selected, dispatch }}
        >
            {children}
            <ItemsDrawer
                items={items}
                itemRefs={itemRefs}
                selected={selected}
                onClear={clearSelected}
            />
        </DrawerContext.Provider>
    )
}

export const ItemsView = ({ filters }: ItemsProps) => {
    const { items, itemRefs } = useDrawerContext()
    const filteredItems = useMemo(
        () =>
            filterItems(items, { known: true, ...filters }).filter(
                ({ isVisible }) => isVisible,
            ),
        [items, filters],
    )
    return <ItemsList items={filteredItems} itemRefs={itemRefs} />
}

function AllItemsView({ filters }: ItemsProps) {
    return (
        <DrawerContextProvider>
            <ItemsView filters={filters} />
        </DrawerContextProvider>
    )
}

export default AllItemsView
