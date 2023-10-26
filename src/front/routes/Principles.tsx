import { useQuery } from "urql"

import Avatar, { AvatarProps } from "@mui/material/Avatar"
import AvatarGroup from "@mui/material/AvatarGroup"
import Box from "@mui/material/Box"
import Card, { CardProps } from "@mui/material/Card"
import CardHeader from "@mui/material/CardHeader"

import { graphql } from "../gql"
import * as types from "../gql/graphql"

const principleQueryDocument = graphql(`
    query Principle {
        principle {
            id
        }
    }
`)

type PrincipleFromQuery = types.PrincipleQuery["principle"][number]

interface PrincipleIconProps extends AvatarProps {
    id: string
}

const PrincipleIcon = ({ id, ...props }: PrincipleIconProps) => (
    <Avatar
        alt={id}
        variant="square"
        src={`/data/principle/${id}.png`}
        {...props}
    ></Avatar>
)

function PrincipleIconGroup({
    principles,
}: {
    principles: PrincipleFromQuery[]
}) {
    return (
        <AvatarGroup variant="square">
            {principles.map(({ id }) => (
                <PrincipleIcon key={id} id={id} sx={{ margin: 2 }} />
            ))}
        </AvatarGroup>
    )
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
        <Card {...cardProps}>
            <CardHeader
                title={title.toString()}
                titleTypographyProps={{ variant: "h6" }}
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

export {
    PrincipleIcon,
    PrincipleIconGroup,
    PrincipleCard,
    Principles as default,
}
