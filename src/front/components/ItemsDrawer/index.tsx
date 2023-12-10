import { RefObject, useEffect, useMemo } from "react"

import Divider from "@mui/material/Divider"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Portal from "@mui/material/Portal"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"

import Delete from "@mui/icons-material/Delete"

import { Principle } from "../../gql/graphql"
import { PrincipleCount, VisibleItem } from "../../types"
import { useDrawerContext } from "../Drawer"
import { PrincipleIcon, PrincipleIconProps } from "../Icon"

interface PrincipleCounterProps extends PrincipleIconProps {
    principle: Principle
    items: VisibleItem[]
    baseCounts?: PrincipleCount[]
}

function PrincipleCounter({
    principle,
    items,
    baseCounts = [],
    ...props
}: PrincipleCounterProps) {
    let total = items.reduce((total, item) => total + (item[principle] ?? 0), 0)
    if (baseCounts.length > 0) {
        const baseCount: PrincipleCount = baseCounts.find(
            ({ principle: p }) => p === principle,
        ) ?? { principle, count: 0 }
        total += baseCount.count
    }
    return total ? (
        <Stack direction="row" alignItems="center">
            <PrincipleIcon principle={principle} {...props} />
            <Typography variant="h6" sx={{ paddingInline: 1 }}>
                {total}
            </Typography>
        </Stack>
    ) : undefined
}

interface PrincipleCounterStackProps {
    items: VisibleItem[]
    baseCounts: PrincipleCount[]
}

const PrincipleCounterStack = ({
    items,
    baseCounts = [],
}: PrincipleCounterStackProps) =>
    items.length > 0 || baseCounts.length > 0 ? (
        <>
            <Typography variant="h6" sx={{ margin: 2 }}>
                Totals:
            </Typography>
            <Stack
                direction="row"
                spacing={2}
                flexWrap="wrap"
                sx={{ margin: 2 }}
            >
                {Object.values(Principle).map((principle) => (
                    <PrincipleCounter
                        key={principle}
                        principle={principle}
                        items={items}
                        baseCounts={baseCounts}
                        sx={{ width: "2rem", height: "2rem" }}
                    />
                ))}
            </Stack>
        </>
    ) : undefined

interface ClearButtonProps {
    onClear(): void
}

const ClearButton = ({ onClear }: ClearButtonProps) => (
    <ListItem disablePadding>
        <ListItemButton onClick={onClear}>
            <ListItemIcon>
                <Delete />
            </ListItemIcon>
            <ListItemText>Clear</ListItemText>
        </ListItemButton>
    </ListItem>
)

interface ItemsDrawerProps {
    items: VisibleItem[]
    itemRefs: RefObject<Map<string, RefObject<HTMLDivElement>>>
    selected: Set<string>
    onClear?(): void
    baseCounts?: PrincipleCount[]
}

function ItemsDrawer({
    items,
    itemRefs,
    selected,
    onClear,
    baseCounts = [],
}: ItemsDrawerProps) {
    const selectedItems = useMemo(
        () => items.filter(({ id }) => selected.has(id)),
        [items, selected],
    )
    const { setOpen, ref } = useDrawerContext()
    useEffect(() => setOpen(selectedItems.length > 0), [selectedItems, setOpen])
    return (
        <Portal container={ref.current}>
            <List sx={{ overflow: "auto", flexGrow: 1 }}>
                {selectedItems.map((item) => (
                    <ListItem key={item.id} disablePadding>
                        <ListItemButton
                            onClick={() =>
                                itemRefs.current
                                    ?.get(item.id)
                                    ?.current?.scrollIntoView({
                                        behavior: "smooth",
                                    })
                            }
                        >
                            <ListItemText>{item.name}</ListItemText>
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <List sx={{ flexGrow: 0 }}>
                <Divider />
                <PrincipleCounterStack
                    items={selectedItems}
                    baseCounts={baseCounts}
                />
                {onClear && (
                    <>
                        <Divider />
                        <ClearButton onClear={onClear} />
                    </>
                )}
            </List>
        </Portal>
    )
}
export default ItemsDrawer
