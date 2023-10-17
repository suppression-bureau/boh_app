import { useQuery } from "urql"

import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardHeader from "@mui/material/CardHeader"
import CardContent from "@mui/material/CardContent"
import CardActions from "@mui/material/CardActions"

import { PrincipleCard } from "../routes/Principles"
import { graphql } from "../gql"

const skillQueryDocument = graphql(`
    query Skills {
        skill {
            id
            level
            primary_principle {
                id
            }
            secondary_principle {
                id
            }
        }
    }
`)

function Skill(props) {
    return (
        <Card key={props.id}>
            <CardHeader title={props.id} />
            <CardContent sx={{ display: "inline-flex" }}>
                <PrincipleCard
                    key={props.primary_principle.id}
                    id={props.primary_principle.id}
                    title={props.level + 1}
                />
                <PrincipleCard
                    key={props.secondary_principle.id}
                    id={props.secondary_principle.id}
                    title={props.level}
                />
            </CardContent>
            <CardActions>
                {/* TODO: PUT change to database */}
                <Button>Upgrade Skill</Button>
            </CardActions>
        </Card>
    )
}

const Skills = () => {
    const [{ data }] = useQuery({ query: skillQueryDocument })
    return (
        <Box
            sx={{
                maxWidth: "450px",
                marginBlock: 1,
                marginInline: "auto",
                display: "flex",
                flexDirection: "column",
                rowGap: 1,
            }}
        >
            {data!.skill
                .filter(({ level }) => level > 0)
                .map(({ ...skill }) => (
                    <Skill key={skill.id} {...skill} />
                ))}
        </Box>
    )
}

export default Skills
