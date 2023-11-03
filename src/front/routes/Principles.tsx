import { useQuery } from "urql"

import Avatar, { AvatarProps } from "@mui/material/Avatar"
import Box from "@mui/material/Box"
import Card, { CardProps } from "@mui/material/Card"
import CardHeader from "@mui/material/CardHeader"

import AvatarStack from "../components/AvatarStack"
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

export interface PrincipleIconProps extends Omit<AvatarProps, "src"> {
    principle: string
}

const PrincipleIcon = ({
    principle,
    alt = principle,
    title = principle,
    variant = "square",
    ...props
}: PrincipleIconProps) => (
    <Avatar
        alt={alt}
        title={title}
        variant={variant}
        src={new URL(`/data/principle/${principle}.png`, import.meta.url).href}
        {...props}
    />
)

interface PrincipleIconGroupProps {
    principles: PrincipleFromQuery[]
}

function PrincipleIconGroup({ principles }: PrincipleIconGroupProps) {
    return (
        <AvatarStack>
            {principles.map(({ id }) => (
                <PrincipleIcon key={id} principle={id} />
            ))}
        </AvatarStack>
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
                title={String(title)}
                titleTypographyProps={{ variant: "h6" }}
                avatar={<PrincipleIcon principle={id} />}
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
