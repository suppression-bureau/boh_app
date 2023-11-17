import Box from "@mui/material/Box"
import Card, { CardProps } from "@mui/material/Card"
import CardHeader from "@mui/material/CardHeader"

import AvatarStack from "../components/AvatarStack"
import { PrincipleIcon } from "../components/Icon"
import * as types from "../gql/graphql"

interface PrincipleIconGroupProps {
    principles: types.Principle[]
}

function PrincipleIconGroup({ principles }: PrincipleIconGroupProps) {
    return (
        <AvatarStack>
            {principles.map((principle) => (
                <PrincipleIcon key={principle} principle={principle} />
            ))}
        </AvatarStack>
    )
}

interface PrincipleCardProps extends Omit<CardProps, "title"> {
    id: types.Principle
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

const Principles = () => (
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
        {Object.values(types.Principle).map((principle) => (
            <PrincipleCard key={principle} id={principle} />
        ))}
    </Box>
)

export { PrincipleIconGroup, PrincipleCard, Principles as default }
