/*
* Tencent is pleased to support the open source community by making Puerts available.
* Copyright (C) 2020 THL A29 Limited, a Tencent company.  All rights reserved.
* Puerts is licensed under the BSD 3-Clause License, except for the third-party components listed in the file 'LICENSE' which may be subject to their corresponding license terms.
* This file is subject to the terms and conditions defined in file 'LICENSE', which is part of this source code package.
*/

using System;
using System.Diagnostics;
using UnrealBuildTool;
using System.IO;
using EpicGames.Core;

public class ReactUMG : ModuleRules
{
	public ReactUMG(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

		PublicDependencyModuleNames.AddRange(new string[]
		{
			"Core", "CoreUObject", "Engine", "InputCore", "Serialization", "UMG"
        });

		bEnableExceptions = true;

		string coreTSPath = Path.GetFullPath(Path.Combine(ModuleDirectory, "..", "..", "TypeScript"));
		string destDirName = Path.GetFullPath(Path.Combine(ModuleDirectory, "..", "..", "..", "..", "TypeScript", "react-umg"));
		DirectoryCopy(coreTSPath, destDirName, true);

        string projectDir = Path.Combine(PluginDirectory, "..", "..");
        string packageJsonPath = Path.Combine(projectDir, "package.json");
        string packageJsonPath2 = Path.Combine(projectDir, "Content", "JavaScript", "package.json");
        if (!File.Exists(packageJsonPath))
        {
            File.WriteAllText(packageJsonPath, "{\n  \"dependencies\": {\n    \"@types/react-reconciler\": \"^0.28.9\",\n    \"@types/react-router\": \"^5.1.20\",\n    \"react-reconciler\": \"^0.28.0\",\n    \"react-router\": \"^5.3.4\"\n  }\n}\n");
        }

        if (!File.Exists(packageJsonPath2))
        {
            File.WriteAllText(packageJsonPath2, "{\n  \"dependencies\": {\n    \"react-reconciler\": \"^0.28.0\",\n    \"react-router\": \"^5.3.4\"\n  }\n}\n");
        }
    }

	private static void DirectoryCopy(string sourceDirName, string destDirName, bool copySubDirs)
	{
		DirectoryInfo dir = new DirectoryInfo(sourceDirName);

		if (!dir.Exists)
		{
			throw new DirectoryNotFoundException(
			"Source directory does not exist or could not be found: "
			+ sourceDirName);
		}

		if (!Directory.Exists(destDirName))
		{
			Directory.CreateDirectory(destDirName);
		}

		// Get the files in the directory and copy them to the new location.
		FileInfo[] files = dir.GetFiles();
		foreach (FileInfo file in files)
		{
			string temppath = Path.Combine(destDirName, file.Name);
			file.CopyTo(temppath, true);
		}

		if (copySubDirs)
		{
			DirectoryInfo[] dirs = dir.GetDirectories();
			foreach (DirectoryInfo subdir in dirs)
			{
				string temppath = Path.Combine(destDirName, subdir.Name);
				DirectoryCopy(subdir.FullName, temppath, copySubDirs);
			}
		}
	}

}
