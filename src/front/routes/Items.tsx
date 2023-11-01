import {
    MouseEvent,
    MouseEventHandler,
    RefObject,
    useCallback,
    useMemo,
    useState,
} from "react"
import { useQuery } from "urql"

import Drawer from "@mui/material/Drawer"
import List from "@mui/material/List"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemText from "@mui/material/ListItemText"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"

import { graphql } from "../gql"
import * as types from "../gql/graphql"
import { AspectIconGroup } from "../routes/Aspects"
import { PrincipleIcon } from "../routes/Principles"
import { PRINCIPLES, PrincipleString } from "../types"

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

type ItemFromQuery = types.ItemsQuery["item"][number]
interface VisibleItem extends ItemFromQuery {
    isVisible: boolean
}
type AspectFromQuery = ItemFromQuery["aspects"][number]

interface ItemsProps {
    filters?: {
        known?: boolean
        aspects?: AspectFromQuery[]
        principles?: Pick<types.Principle, "id">[]
    }
}

function setVisible(item: ItemFromQuery, visible: boolean): VisibleItem {
    return { ...item, isVisible: visible }
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
            .map((principle) =>
                filteredState
                    .filter((item) => item[principle] !== null)
                    // NB: this doesn't work with principles.length > 1
                    .toSorted(
                        (a, b) => (b[principle] ?? 0) - (a[principle] ?? 0),
                    ),
            )
            .reduce((a, b) => a.concat(b), [])
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
    const filteredItems = new Set(filteredState.map(({ id }) => id))
    return state.map((item) => setVisible(item, filteredItems.has(item.id)))
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
            <PrincipleIcon id={principle} />
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
        {PRINCIPLES.filter((principle) => item[principle] != null).map(
            (principle) => (
                <ItemPrincipleValue
                    key={principle}
                    principle={principle}
                    value={item[principle]!}
                />
            ),
        )}
        <AspectIconGroup aspects={aspects} />
    </Stack>
)

export interface ItemProps extends ItemFromQuery {
    selected?: boolean | undefined
    onClick?: MouseEventHandler<HTMLDivElement> | undefined
}

function Item({ selected = false, onClick, ...item }: ItemProps) {
    return (
        <ListItemButton selected={selected} onClick={onClick}>
            <ListItemText primary={item.id} />
            <ItemValues {...item} />
        </ListItemButton>
    )
}
const ItemsView = ({ filters }: ItemsProps) => {
    const [{ data }] = useQuery({ query: itemsQueryDocument })
    const items = useMemo(
        () => filterItems(data!.item, { known: true, ...filters }),
        [data, filters],
    )
    const [selected, setSelected] = useState(
        new Map<string, RefObject<HTMLDivElement>>(),
    )
    const toggleSelected = useCallback(
        (e: MouseEvent<HTMLDivElement>, id: string) => {
            if (selected.has(id)) {
                selected.delete(id)
            } else {
                selected.set(id, { current: e.currentTarget })
            }
            setSelected(new Map(selected))
        },
        [selected],
    )
    return (
        <>
            <List
                sx={{
                    maxWidth: "sm",
                    marginInline: "auto",
                }}
            >
                {items
                    .filter(({ isVisible }) => isVisible)
                    .map((item) => (
                        <Item
                            key={item.id}
                            selected={selected.has(item.id)}
                            onClick={(e) => toggleSelected(e, item.id)}
                            {...item}
                        />
                    ))}
            </List>
            <Drawer
                variant="persistent"
                open={!!selected.size}
                sx={{
                    maxWidth: "250px",
                    "& .MuiDrawer-paper": { width: "250px" },
                }}
            >
                {[...selected].map(([id, ref]) => (
                    <Item
                        key={id}
                        onClick={() =>
                            ref.current!.scrollIntoView({
                                behavior: "smooth",
                            })
                        }
                        {...data!.item.find((item) => item.id === id)!}
                    />
                ))}
            </Drawer>
        </>
    )
}
export default ItemsView
