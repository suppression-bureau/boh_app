import { RefObject } from "react"

import Divider from "@mui/material/Divider"
import Drawer from "@mui/material/Drawer"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"

import Delete from "@mui/icons-material/Delete"

import { VisibleItem } from "../routes/Items"
import { PrincipleIcon } from "../routes/Principles"
import { PRINCIPLES, PrincipleString } from "../types"

interface ItemsDrawerProps {
    items: VisibleItem[]
    itemRefs: RefObject<Map<string, RefObject<HTMLDivElement>>>
    onClear?(): void
}

function PrincipleCounter({
    principle,
    items,
}: {
    principle: PrincipleString
    items: VisibleItem[]
}) {
    const total = items.reduce((total, item) => total + item[principle]!, 0)
    return total ? (
        <Stack direction="row" alignItems="center">
            <PrincipleIcon id={principle} />
            <Typography
                variant="h6"
                sx={{
                    paddingInline: 1,
                }}
            >
                {total}
            </Typography>
        </Stack>
    ) : null
}

function PrincipleCounterStack({ items }: { items: VisibleItem[] }) {
    return (
        <>
            <Typography variant="h6" sx={{ margin: 2 }}>
                Totals:
            </Typography>
            <Stack
                direction="row"
                spacing={2}
                flexWrap="wrap"
                useFlexGap
                sx={{ margin: 2 }}
            >
                {PRINCIPLES.map((principle) => (
                    <PrincipleCounter
                        key={principle}
                        principle={principle}
                        items={items}
                    />
                ))}
            </Stack>
        </>
    )
}

function ItemsDrawer({ items, itemRefs, onClear }: ItemsDrawerProps) {
    return (
        <Drawer
            variant="persistent"
            open={items.length > 0}
            sx={{
                maxWidth: "250px",
                "& .MuiDrawer-paper": { maxWidth: "250px" },
            }}
        >
            <List sx={{ flexGrow: 1 }}>
                {items.map((item) => (
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
                            <ListItemText>{item.id}</ListItemText>
                        </ListItemButton>
                    </ListItem>
                ))}
                <Divider />
                <PrincipleCounterStack items={items} />
                <Divider />
                {onClear && (
                    <ListItem disablePadding>
                        <ListItemButton onClick={onClear}>
                            <ListItemIcon>
                                <Delete />
                            </ListItemIcon>
                            <ListItemText>Clear</ListItemText>
                        </ListItemButton>
                    </ListItem>
                )}
            </List>
        </Drawer>
    )
}
export default ItemsDrawer
