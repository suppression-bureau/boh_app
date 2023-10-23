import { useQuery } from "urql"

import Avatar from "@mui/material/Avatar"
import Box from "@mui/material/Box"
import Card, { CardProps } from "@mui/material/Card"
import CardHeader from "@mui/material/CardHeader"

import { graphql } from "../gql"

const principleQueryDocument = graphql(`
    query Principle {
        principle {
            id
        }
    }
`)

function PrincipleIcon({ id }: { id: string }) {
    return <Avatar variant="square" src={`/data/principle/${id}.png`}></Avatar>
}

interface PrincipleCardProps extends Omit<CardProps, "title"> {
    id: string
    title?: object | string | number
    disablePadding?: boolean
}

function PrincipleCard({
    id,
    title = id,
    disablePadding = false,
    ...cardProps
}: PrincipleCardProps) {
    return (
        <Card key={id} {...cardProps}>
            <CardHeader
                title={title.toString()}
                avatar={<PrincipleIcon id={id} />}
                sx={{ padding: disablePadding ? 0 : 2 }}
            />
        </Card>
    )
}

const Principles = () => {
    const [{ data }] = useQuery({ query: principleQueryDocument })
    return (
        <Box
            sx={{
                maxWidth: "350px",
                marginBlock: 1,
                marginInline: "auto",
                display: "flex",
                flexDirection: "column",
                rowGap: 1,
            }}
        >
            {data!.principle.map(({ id }) => (
                <PrincipleCard key={id} id={id} />
            ))}
        </Box>
    )
}

export { PrincipleIcon, PrincipleCard, Principles as default }
