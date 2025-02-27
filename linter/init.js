#! /usr/bin/env node

import { mkdir, copyFile, writeFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { parse, stringify } from 'yaml'

const RULES_DIR = path.resolve(import.meta.dirname, './rules')
const RULES_SRC_DIR = path.resolve(import.meta.dirname, './rules-src')
const CONFIG_FILE = path.resolve(import.meta.dirname, '../rescript-lint.mjs')

console.log(RULES_DIR)

try {
    await mkdir(RULES_DIR)
} catch (_e) { }


const { rules } = (await import(CONFIG_FILE)).default

for (const [rule, setting] of Object.entries(rules)) {
    const ruleFileName = `${rule}.yaml`

    const ruleSourceFile = path.resolve(RULES_SRC_DIR, ruleFileName)
    const ruleTargetFile = path.resolve(RULES_DIR, ruleFileName)

    await copyFile(ruleSourceFile, ruleTargetFile)

    const ruleFile = readFileSync(ruleTargetFile, 'utf8')

    const ruleConfig = parse(ruleFile)

    ruleConfig.severity = setting

    const updatedConfig = stringify(ruleConfig)

    await writeFile(ruleTargetFile, updatedConfig)
}

console.log("Successfully configured rescript-ast-grep!")
console.log("Restart the ast-grep language server or restat VSCode to pick up the latest config.")