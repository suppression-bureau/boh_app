import { CardContent } from "@mui/material"
import { useQuery } from "urql"

import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import CardHeader from "@mui/material/CardHeader"
import Stack from "@mui/material/Stack"

import { graphql } from "../gql"
import * as types from "../gql/graphql"
import { Aspect } from "../routes/Aspects"
import { PrincipleCard } from "../routes/Principles"

const itemsQueryDocument = graphql(`
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

function Item({ ...item }: ItemFromQuery) {
    const principles = [
        "edge",
        "forge",
        "grail",
        "heart",
        "knock",
        "lantern",
        "moon",
        "moth",
        "nectar",
        "rose",
        "scale",
        "sky",
        "winter",
    ]
    return (
        <Card key={item.id}>
            <CardHeader title={item.id} />
            <CardContent>
                {item.aspects!.map(({ id }) => (
                    <Aspect key={id} id={id} />
                ))}
            </CardContent>
            <CardActions>
                {principles.map((principle) => {
                    if (item[principle] !== null)
                        return (
                            <PrincipleCard
                                key={principle}
                                id={principle}
                                title={item[principle]} // displays amount
                            />
                        )
                })}
            </CardActions>
        </Card>
    )
}
const ItemsView = () => {
    const [{ data }] = useQuery({ query: itemsQueryDocument })
    return (
        <Stack
            spacing={2}
            sx={{
                maxWidth: "450px",
                marginBlock: 1,
                marginInline: "auto",
            }}
        >
            {data!.item
                .filter(({ known }) => known === true)
                .map((item) => (
                    <Item key={item.id} {...item} />
                ))}
        </Stack>
    )
}
export default ItemsView