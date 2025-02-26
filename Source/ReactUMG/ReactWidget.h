/*
 * Tencent is pleased to support the open source community by making Puerts available.
 * Copyright (C) 2020 THL A29 Limited, a Tencent company.  All rights reserved.
 * Puerts is licensed under the BSD 3-Clause License, except for the third-party components listed in the file 'LICENSE' which may
 * be subject to their corresponding license terms. This file is subject to the terms and conditions defined in file 'LICENSE',
 * which is part of this source code package.
 */

#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "Components/VerticalBox.h"
#include "ReactWidget.generated.h"

/**
 *
 */
UCLASS()
class REACTUMG_API UReactWidget : public UVerticalBox
{
    GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "Scripting | Javascript")
	void AddToViewport(int32 ZOrder = 0); 
	UFUNCTION(BlueprintCallable, Category = "Scripting | Javascript")
	void RemoveFromViewport();
protected:
	virtual void OnSlotAdded(UPanelSlot* InSlot) override;
};
