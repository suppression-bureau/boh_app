import { useQuery } from "urql"

import Box from "@mui/material/Box"
import Card, { CardProps } from "@mui/material/Card"
import CardHeader from "@mui/material/CardHeader"
import Avatar from "@mui/material/Avatar"

import { graphql } from "../gql"

const principleQueryDocument = graphql(`
    query Principle {
        principle {
            id
        }
    }
`)

interface PrincipleCardProps extends Omit<CardProps, "title"> {
    id: string
    title?: object | string | number
    disablePadding?: boolean
}

function PrincipleIcon({ id }: { id: string }) {
    return <Avatar variant="square" src={`/data/${id}.png`} />
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
