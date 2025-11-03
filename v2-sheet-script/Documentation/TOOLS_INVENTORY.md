# Financial TruPath Tools - Complete Inventory

## 📊 All 8 Tools Overview

### ✅ Tool 1: Top Level Assessment (NEW)
- **Status**: Exists - Recently pulled from Google Apps Script (Project ID: 1vD0oZW1WOXR0BVQu3DCB_ReLMUDqdfPwMiNohY3ipv4KRq2F2sjv__MA)
- **Current Location**: `/Users/Larry/code/Financial-TruPath-Unified-Platform/apps/Tool-1-Top-level-Assessment/`
- **Type**: Google Apps Script with automated processing
- **Purpose**: This is a comprehensive top-level assessment tool that provides the initial evaluation framework for all TruPath clients. It includes automated form processing with retry logic, lock management for concurrent submissions, and custom menu integration for manual processing. The tool establishes the foundation for all subsequent assessments.
- **Key Features**: 
  - Automated form submission processing with onFormSubmit triggers
  - Lock management to prevent concurrent processing conflicts
  - Retry mechanism for failed submissions
  - Automated cleanup via time-driven triggers (every 10 minutes)
  - Custom menu for manual processing options
  - Google Doc report generation with customized formatting
- **Technical Implementation**: Uses LockService for concurrency control, processes rows individually to minimize conflicts, includes robust error handling and retry logic
- **Special Features**: Processes form data directly in Google Sheets with URL generation for personalized reports

### 🔄 Tool 2: Comprehensive Orientation & Financial Clarity Assessment (COMBINED)
- **Status**: Planned consolidation of three existing tools
- **Components Being Combined**:
  1. **Tool1_Orientation.js** - 25-field comprehensive assessment for student profiling
  2. **Tool2_FinancialClarity.js** - Adaptive financial questioning based on Tool 1 insights  
  3. **Tool1_Enhanced_SAVED.js** - Enhanced 32-field assessment with psychological depth
- **Current Locations**: 
  - JS Files: `/Users/Larry/code/Financial-TruPath-Unified-Platform/v2-sheet-script/`
  - Original Tool 1 Form: https://docs.google.com/forms/d/1A_FjAQbk9fqqWrW7jKXeYl1xJX7EtwCERAjvKY9Xeys/edit
  - Original Tool 1 Script ID: 1S3ujOblMA1pRX4e3YEWGjj03r3yqD7PpbttcohslVuDPx8-KS3HdV60H
  - Original Tool 2 Folder: https://drive.google.com/drive/u/0/folders/1ZGO8R2mAnDgMg6n4gY1Iyc3_-mk2Rwwk
  - Original Tool 2 Script ID: 1mBM0aQkljcoWbOh-0Zu84XJrJtItCRSEJwtXnDxkZVpKdvJO7viE5lDo
- **Type**: Hybrid web app / Google Apps Script (planned migration)
- **Combined Purpose**: This comprehensive tool serves as the complete orientation and financial clarity assessment for TruPath clients. It:
  - Gathers essential demographic and financial data to establish student profiles
  - Explores all aspects of their financial situation through adaptive questioning
  - Provides insights into subconscious drivers of financial limitations
  - Generates customized reports with roadmaps for improvement
  - Creates excitement for upcoming course content through personalized insights
  - Includes emotional assessment integration to track impact
- **Google Sheets Used**: 
  - Original Tool 1: https://docs.google.com/spreadsheets/d/18JP-qzGaQwv2dGmqGaTZZ6TNAJORxGrCK6tIkc0xlM0/edit?gid=1856419087#gid=1856419087
  - Original Tool 2: https://docs.google.com/spreadsheets/d/11vLtB5AIcuxghItuPc0V7Mk7JWrAQx1S0AIjmwLximM/edit?usp=sharing
  - Emotional Assessment: https://docs.google.com/spreadsheets/d/1YcfCafs1_EZq3jnXIDG9VxxUy8HPQ9GLFRRF1E9DSck/edit?resourcekey=&gid=711565173#gid=711565173
- **Google Forms Used**:
  - Original Tool 2 Form: https://docs.google.com/forms/d/1XqrBcZ92sk6f4zAbWw8r4cSkMSb1F-YF2TaEnCb0izw/edit
  - Emotional Assessment Form: https://docs.google.com/forms/d/1pyywd-UMBRO1CpMO-LCRlj6DSLgmNu3wyLoexP2Stp8/edit
- **Key Features from Combined Tools**:
  - Establishes unique student ID for course continuity
  - Adaptive questioning that adjusts based on previous responses
  - Cross-tool insights generation
  - Framework-based scoring and validation
  - Comprehensive psychological and financial profiling
  - Emotional impact assessment integration
- **Special Features**: The combination leverages ToolFramework for data validation, scoring, and cross-tool insights. Questions adapt dynamically based on discovered insights, providing a personalized assessment experience

### 🔄 Tool 3:  False self view / external validation grounding tool
- **Status**: Exists but not in code folder /  We have to combine two forms and two tools into one tool.
- **Current Locations**:  False self-view Folder: https://drive.google.com/drive/u/0/folders/1DZDMQZGu7Fc9-LHIekzeJJhCkwHw6iBW
  External Validation Folder: https://drive.google.com/drive/u/0/folders/1RTw2v3mH8pz4Xc4DB-Rt05pwer3iQXyB , `/Users/Larry/code/External-Validation-Grounding/`
- **Type**: Google Apps Script / I think we should migrate everything at least to a hybrid web app / app script if not full web app
- **Purpose**:  The purpose of both of these apps is to explore through questions how the subconscious strategies of external validation and living in a false self-view negatively impact the financial mindset, choices, and actions of the student. As well as providing them with a customized output report, giving them clarity as to how these strategies impact their lives as well as suggestions on how to improve.
- **Google Sheets Used**:  False Self-View:  https://docs.google.com/spreadsheets/d/1e_Kzu1PnzlZKjN0H86jPz16DebrrrLVp79tWNUR6QkA/edit?resourcekey=&gid=1192594934#gid=1192594934
                           External Validation:  https://docs.google.com/spreadsheets/d/1OKWjMJELp21616A7WQQmsELr_J4RmY3xqChaoNMQjao/edit?gid=318735288#gid=318735288
- **Google Forms Used**:   False Self-View:  https://docs.google.com/forms/d/1SHCLgRelyMyDTk2qjfixKUVv2Ba-cp3U6npVmpU6His/edit
                           External Validation:  https://docs.google.com/forms/d/134SM8ev0vba1C2tRQOVxqD7o-9pF9y_veD7-DZj1AEA/edit
- **Google Scripts ID**:   False Self-View:  1pZI5ShwefZ6tdHtLhnmxu-7LLlkBiI3yXKCrpQ6_RXPQK8WMgBXz295M
                           External Validation:  1IHvqydiwlP8qXNuqNwBbqf5Pz5cCtziZdv51yRI9jxs3NaSs_dUmJdxM
- **Special Features**: 

### 🔄 Tool 4: Financial Freedom Framework / Allocation Calculator Tool
- **Status**: Exists but not in code folder / Planned
- **Current Location**: https://drive.google.com/drive/u/0/folders/1xLYj7xH1NRQN_HlW3pLV9tVehe_B6NBV
- **Type**: Google Apps Script / at least a hybrid web app / Google Script
- **Purpose**: The purpose of this tool is to give every dollar of income into a person's life a job. Specifically, this is a top-level budgeting tool, looking at both their current situation, their ambition, and their psychological behaviors to determine a proper distribution into one of four buckets for each dollar they have.
- A multiply bucket, which is concerned with retirement.
- A necessary expenses or needs bucket.
- A financial freedom bucket, which is emergency savings, short-term spending.
- A fun bucket, which is just a spending bucket.
This app not only identifies the percentage distribution of each dollar into those four buckets but talks about how and why that distribution was made through a customized report.
- **Google Sheets Used**:  https://docs.google.com/spreadsheets/d/1rYA0Pky8cFR5cizPaGm_xO8SBenBVItFM5nViJhgKIM/edit?resourcekey=&gid=710708552#gid=710708552
- **Google Forms Used**:   https://docs.google.com/forms/d/110eAUS3acW_MtJhMZJ-vN9Cneyzn2Waj7F7sSZvIvvE/edit
- **Google Scripts ID**:  1t9ZolLEffBEXiGc3c7ozA2aAJc9hA3awKFAP2620KHuHmVPERj_HdY0N
- **Special Features**: I think this one could  potentially benefit from being a full web app, similar to the Investment Calculator, allowing them to see how different choices could change the distribution. 

### ✅ Tool 5: Issues Showing Love Grounding
- **Status**: Exists
- **Current Location**: `/Users/Larry/code/Issues-Showing-Love-Grounding/`. Google Drive: https://drive.google.com/drive/u/0/folders/1O1t6V00H2DZz-sX4buQdzXfTNcLiw6iO
- **Type**: Google Apps Script / I think all should transition into hybrid web app / google script
- **Purpose**:  the purpose of this app is to explore through questions how the subconscious strategies of "issues showing love" and "issues receiving love" negatively impact the financial mindsets, choices, and actions of the user, both giving them an idea of how much they cause problems and giving them customized suggestions on what to do about it
- **Google Sheets Used**:  https://docs.google.com/spreadsheets/d/1Y5pGllwbS7ub5sn7RCKMsHsHkTYr86qpvsff_dpigQ4/edit?resourcekey=&gid=1035399470#gid=1035399470
- **Google Forms Used**:   https://docs.google.com/forms/d/1XbAmuvPJYBInd3lNaxx55gJHwzkXgZQ9pVoj8tSlxk0/edit
- **Google Scripts ID**:   1RSVTQqeI-1oKlFdJAHxKEcZmvmOVO6kQw2tfxhfwRC5o2VaPGbmUrJMH
- **Special Features**: [Any special features]

### ✅ Tool 6:  Retirement Blueprint Creator Tool
- **Status**: Exists - Needs debugging
- **Current Location**: `/Users/Larry/code/retirement-blueprint/`. Google Drive folder: https://drive.google.com/drive/u/0/folders/1bfqekS_hBzKcW0RIzTYDyDd6evSPzqUp
- **Type**: Google Apps Script / I think all should transition into hybrid web app / google script
- **Purpose**: The purpose of this tool is to identify the current financial situation of the client and their desired future, which helps us determine urgency in getting there as well as their ambition between three domains of savings for retirement.

Then, understanding the current demographic situation which determines the IRS limitations on which retirement vehicles are available to them, we utilize the importance and urgency being able to order those retirement vehicles and cascade their available retirement dollars—both from an actual where they are today standpoint and an ideal standpoint—across all those retirement vehicles.

Producing a customized retirement blueprint that helps guide them into creating the retirement structures necessary to create the future they want. 
- **Google Sheets Used**:  https://docs.google.com/spreadsheets/d/1QV9KoueTktz7mJhnuhsEkF-ayzv54vT6W4kyu84oiuY/edit?resourcekey=&gid=680645939#gid=680645939
- **Google Forms Used**:  Phase 1:  https://docs.google.com/forms/d/1w4aPniYDM3oxiT-crPghmn9sYxYaw51sSexktoZJE8A/edit
Phase 2 has 9 forms 1 per profile: 
1: https://docs.google.com/forms/d/1jv_rpG_i6O26BB0TcTtF_pxjYyvIXfA5qXTNPT8uzec/edit
2: https://docs.google.com/forms/d/1XjpC0o75D4Lgu07hegkK1c5LD47TU6M78Kdywhj8Ao8/edit
3: https://docs.google.com/forms/d/1ur5MAwKetidU52v1xQDZSMn5LjefpIQqGbngxLR8dOE/edit
4: https://docs.google.com/forms/d/1B1VaZanAkzb6QB86knxk9eWhlNFpH-st65pdX__CvnE/edit
5: https://docs.google.com/forms/d/15clxf7SsHDxz05m5GetbCRToxb48eMrNk9Dpz4dVFO8/edit
6: https://docs.google.com/forms/d/1_GPFDAOkM0QQuJxWfTRNJjLfIW8IwRxwQrfiMvqgJK4/edit
7: https://docs.google.com/forms/d/1zv6LiVaeW0D9NbsKkCMgo40zcYhzSDlIQq5Zw7IXhuw/edit
8: https://docs.google.com/forms/d/1CXFEpBy4XA49CXA7R66lHAosEE5CzANH9Vl6B1opxYQ/edit
9: https://docs.google.com/forms/d/1kGGt6z6dovWvzHkSPfmeTg3E5-Lv3gT1hhlDOwUyiik/edit
- **Google Scripts ID**:  1u76NxCIbrJ0suSF5TKcI1VFE6KfaLxhdhCZ183CKQ-s217AaYq5O5TwD
- **Special Features**: This one might benefit by being a complete web app with real-time feedback similar to the investment calculator. 

### ✅ Tool 7: Control Fear Grounding
- **Status**: Exists  
- **Current Location**: `/Users/Larry/code/Control_Fear_Grounding/`. Google Drive folder: https://drive.google.com/drive/u/0/folders/1YtSMt7Ti9CHrKociTisr2lfs6QRkMGoN
- **Type**: Google Apps Script / I think all should transition into hybrid web app / google script 
- **Purpose**: The purpose of this tool is to use questions to identify where the strategies of needing to control your world or living in fear negatively impact your financial mindsets, decisions, and actions. This provides a customized report to help the individual identify where different strategies of fear and control impact their financial situations, to what degree they impact them, and what to do about them. 
- **Google Sheets Used**:  https://docs.google.com/spreadsheets/d/1g1Thn01PhZFBjCrFhJ-oj_Wkd8PEICJ3u5nmWmA47Pg/edit?resourcekey=&gid=761168069#gid=761168069
- **Google Forms Used**:   https://docs.google.com/forms/d/1PewmMurbTa3GrErnOAH-T5O9SqNbHqrXa25AaDQqgDQ/edit
- **Google Scripts ID**:   1ERmo9o9fH8eAi9ZUbuFr0T31VgO3DrXZ1dMguEMedOqBzC-GnJwmTeqt
- **Special Features**: 

### ✅ Tool 8: Investment Tool
- **Status**: Exists
- **Current Location**: `/Users/Larry/code/Control_Fear_Investment_Tool/`. Google Drive folder: https://drive.google.com/drive/u/0/folders/19IB-p_cqapW7xiLBBEmUxbDqE_2cQSlw
- **Type**: Google Apps Script + HTML
- **Purpose**: The purpose of this tool is to provide an Interactive environment for a student to explore different scenarios for their retirement planning, as well as to be able to calculate different aspects of that retirement planning, such as:
- The type of return they need to get where they want to go
- How the monthly spending in retirement impacts their planning
- The time to retirement
- The necessary nest egg at the end as well as the beginning
This tool is completely interactive, allowing them to both identify different scenarios, save those scenarios, and compare those scenarios, providing customized outputs and reports on each scenario or within comparisons.
- **Google Sheets Used**:  https://docs.google.com/spreadsheets/d/1_c4JB4VG4q-fekL2T1s6nUo83Ko1nZbAkSkDfFM1X0M/edit?gid=1130661473#gid=1130661473
- **Google App Used**:   https://script.google.com/macros/s/AKfycbwPNkcEebvkUbJz1jv24ERMC_rJDcmawWbMemIvDf2Ynd0xg7u_1VgcfuWC2bIMC_ZD/exec
- **Google Scripts ID**: https://script.google.com/home/projects/1PoeKSstGaHaUXwo3ZldO2lyCGKHZab_r-ufu5OfCgnwdR8vRZ0ti5Ede/edit -- 1PoeKSstGaHaUXwo3ZldO2lyCGKHZab_r-ufu5OfCgnwdR8vRZ0ti5Ede
- **Special Features**: 

---

### Shared Libraries
- **Location**: `/Users/Larry/code/shared-libs/`
- **Contains**: Common functions used across tools
- **Should be integrated**: Yes

### Other Related Files
- Investment Tool Redirect: `/Users/Larry/code/investment-tool-redirect/`
- Google Sheets Tools: `/Users/Larry/code/google-sheets-tools/`

---

## 🎯 Next Steps After Inventory

1. **Download missing Google Apps Scripts** using clasp
2. **Copy all code** to `/Financial-TruPath-Unified-Platform/apps/`
3. **Organize by tool** in separate folders
4. **Create comprehensive plan** in new folder
5. **Begin migration** with clear roadmap

---

## 📝 Notes
[Add any additional context, dependencies, or important information here]