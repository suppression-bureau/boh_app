import { useQuery } from "urql"
import axios from "axios"
import { useState } from "react"

import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardHeader from "@mui/material/CardHeader"
import CardContent from "@mui/material/CardContent"
import CardActions from "@mui/material/CardActions"

import { PrincipleCard } from "../routes/Principles"
import { graphql } from "../gql"

const API_URL = "http://localhost:8000"

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
    const [skill, setSkill] = useState(props)

    function upgradeSkill() {
        axios
            .patch(`${API_URL}/skill/${props.id}`, {
                level: props.level + 1,
            })
            .then((response) => {
                setSkill(response.data)
            })
    }

    return (
        <Card key={skill.id}>
            <CardHeader title={skill.id} />
            <CardContent sx={{ display: "inline-flex" }}>
                <PrincipleCard
                    key={skill.primary_principle.id}
                    id={skill.primary_principle.id}
                    title={skill.level + 1}
                />
                <PrincipleCard
                    key={skill.secondary_principle.id}
                    id={skill.secondary_principle.id}
                    title={skill.level}
                />
            </CardContent>
            <CardActions>
                {/* TODO: PUT change to database */}
                <Button onClick={upgradeSkill}>Upgrade Skill</Button>
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
