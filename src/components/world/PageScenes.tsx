"use client";

import { notFoundScenes, recordScenes } from "./scenes";
import { WorldScenes } from "./store";

const record = recordScenes();

export const RecordScenes = () => <WorldScenes scenes={record} />;
export const NotFoundScenes = () => <WorldScenes scenes={notFoundScenes} />;
