import { useQuery } from "urql"
import axios from "axios"
import { useEffect, useState } from "react"

import Autocomplete from "@mui/material/Autocomplete"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardHeader from "@mui/material/CardHeader"
import CardContent from "@mui/material/CardContent"
import CardActions from "@mui/material/CardActions"
import Dialog from "@mui/material/Dialog"
import TextField from "@mui/material/TextField"

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

// TODO: reload after updates
const SkillsView = () => {
    const [{ data }] = useQuery({ query: skillQueryDocument })
    // const [data, setData] = useQuery({ query: skillQueryDocument })

    const [open, setOpen] = useState(false)
    const [newSkill, setNewSkill] = useState("")

    const handleClickOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const handleNewSkill = (event, value) => {
        setNewSkill(value)
    }
    function learnSkill() {
        axios
            .patch(`${API_URL}/skill/${newSkill}`, { level: 1 })
            .then((response) => {
                console.log(response.data)
                setOpen(false)
            })
    }

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
            <Button onClick={handleClickOpen}>Learn new Skill</Button>
            {/* TODO: style that baby */}
            <Dialog open={open} onClose={handleClose}>
                <Autocomplete
                    id="skill-selector"
                    options={data!.skill
                        .filter(({ level }) => level == 0)
                        .map((s) => s.id)}
                    sx={{ width: 300 }}
                    renderInput={(params) => (
                        <TextField {...params} label="Skill" />
                    )}
                    onChange={handleNewSkill}
                />
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={learnSkill}>Learn</Button>
            </Dialog>
            {data!.skill
                .filter(({ level }) => level > 0)
                .map(({ ...skill }) => (
                    <Skill key={skill.id} {...skill} />
                ))}
        </Box>
    )
}

export default SkillsView
