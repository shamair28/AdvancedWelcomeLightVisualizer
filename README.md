# Advanced Welcome Light Visualizer

This simple website was created to help creating welcome light animations for BMW cars with FLM2 control units.

## Description

This website will help you to analyse the welcome light sequences with diagrams that show what the current sequence would do.
The sequences are stored in one or two datapoints of the left FLM2 [0x43] and right FLM2 [0x44] control unit.

**Staging1_Data** first storage of 252 Byte  
**Staging2_Data** fecond storage of 168 Byte

This gives you a total of 420 Byte to store the animation.  
The sequences differ depending on the model due to the available light sources.

*<u>Quick breakdown of the sequences</u>*  
Example: `01, 00, 07, 05, 32, 0A, 32, 05, 64, 0A, 64, 05, 32, 0A, 32, 05, 00`  

Channel: `01`  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Identifier for the channel which shows the sequence

Length: `00, 07`  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Length in pairs of the sequence. `07` are 7 pairs of two bytes or 14 bytes in total.

Sequence: `05, 32, 0A, 32, 05, 64, 0A, 64, 05, 32, 0A, 32, 05, 00`
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;First Byte is the duration and the second Byte is the brightness.
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Duration Byte to decimal and multiplied with 20 results in the time in milliseconds.
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*Validated with 60fps video recordings of BMW G20 2020 FLM2 module. See [timing_analysis.md](timing_analysis.md) for details.*
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Brightness Byte to decimal is the brightness in percent
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1. `05, 32` will raise the brightness to 50% in 100ms
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2. `0A, 32` the brightness will stay at 50% for 200ms
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3. `05, 64` will raise the brightness to 100% in 100ms
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4. `0A, 64` the brightness will stay at 100% for 200ms
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;5. `05, 32` will reduce the brightness to 50% in 100ms
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;6. `0A, 32` the brightness will stay at 50% for 200ms
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;7. `05, 00` will reduce the brightness to 0% in 100ms

Credits to **[sig_serg](https://g20.bimmerpost.com/forums/showpost.php?p=31850938&postcount=107)** and **[SimR](https://g20.bimmerpost.com/forums/showpost.php?p=31870641&postcount=110)** for reverse engineering and explaining this.

### Preparation

Before you can use this website, you need to copy the data of your Staging1_Data and Staging2_Data fron the left or right FLM2 control unit.  
The data should be the same for the left and right control units, as the animation for the G20 LCI works in a different way that wasn´t reverse engineered yet.

### Base LED (US G20 LCI, CAFD 000043AF)

US G20 LCI cars with base LED headlights use FLM2 CAFD 000043AF (version 016_020_000), which has different animation curves than the Adaptive LED / Laser FLM2 (CAFD 00006DF0).
Switch on the **Base LED** toggle next to the Visualizer Model selector to list only the base LED templates and use the matching visualizer model. The toggle is stored in the URL as `baseled=1`.

Curves ("channels") on base LED:

| Curve | Meaning |
| --- | --- |
| 01 | Inner DRL tube, unlock welcome (on) |
| 02 | Both tubes, second welcome trigger (on) |
| 03 | Both tubes, switch-off (off) |
| 04 | US amber side marker, unlock (on) |
| 05 | US amber side marker, switch-off (off) |
| 06 | US amber side marker, second trigger (on) |
| 07 | Outer DRL tube, unlock welcome (on), only exists with the custom Lmm1 |

The base LED visualizer model draws the animation on a photo of the LCI base LED headlight. The animation player plays it in two phases:

- **Unlock welcome:** curves 01 (inner tube), 07 (outer tube) and 04 (side marker).
- **Switch-off:** curves 03 (both tubes) and 05 (side marker). This phase is anchored at 20 s, about when the car ends the welcome light.

Between the two phases, the tubes hold at 30% and the side marker at 100%, as set by the Lmm1 brightness bytes. Curves 02 and 06 belong to the second welcome trigger, so the player doesn't play them.

To let one curve drive several lights, `physicalLight` in `vehicles.js` accepts a list of channel ids as well as a single one.

The base LED templates require a custom **Lmm1_Data** in both FLM2 Left 0x43 and Right 0x44: stock wert_67 with byte 208 (0-based) changed from `01` to `07`, so the outer tube uses curve 07 instead of curve 01. Lmm2 stays wert_47 and Staging2 stays wert_01. The page shows the required value (and the stock one for comparison) in the Lmm1_Data section.

### Installation

There´s nothing to install, just download the `index.html` file.

### Usage

To use this website you simply open it in any browser of your choice.  
The "paste from clipboard" function may requires a second click because most browsers don´t allow the usage for unsafe or locally stored websites.  
Now you can input the data of your Staging1_Data und Staging2_Data into the fields for the left and right sequence. 
If the data is the same, just input the same data for left and right.  
Now press the "Parse & Build Dynamic Fields" button to create the dynamic fields and diagrams for every sequence available in your data.  
Keep in mind that this only works with correct data where the length byte represents the length of the sequence, otherwise it wont work.

Now you can edit the sequences one by one with a live preview in the diagram.  
The left channel is blue and the right channel is red.  
When both channels follow the same line, it will be shown in green.

Every change in the dynamic fields will be synchronized back to the main data.

If you´re changing the length of a sequence, you need to change the length byte and then parse the data again.  
When using the wrong length byte, your sequences will be destroyed.

The website will automatically use Staging2_Data when you extend the length of a sequence and adjust the data accordingly. It will also add the correct number of empty 00 Bytes to the end of Staging2_Data.

### Limitations

The website is currently not able to verify and automatically adjust the length byte. Maybe i´ll try to add this in the future.

## Version history

* 0.1
    * First release
    * Creating dynamic fields for every sequence until `00, 00, 00` is detected
    * Creating dynamic diagrams that show both sequences
        * Left sequence blue
        * Right sequence red
        * Left and right identical green
        * Diagrams auto update with every change
    * Copy to clipboard
    * Paste from clipboard
    * Clear all

### Ideas for future releases

* Add an export functionality
* Add templates for different models

## License

Advanced Welcome Light Visualizer © 2025 by Michael Oberhaus (MichaelNRW, bredmich) is licensed under CC BY-NC-SA 4.0  
See the license.md file for details.

## Acknowledgments

Thanks to sig_serg and SimR from the bimmerpost.com forums for reverse engineering and explaining how the data works.  
[sig_serg](https://g20.bimmerpost.com/forums/member.php?u=852876)  
[SimR](https://g20.bimmerpost.com/forums/member.php?u=886522)  
Thanks to [Michael Dreier](https://github.com/eMDi101) for creating of the first draft and mentoring while creating this website!

## Disclaimer

BMW and Mini are registered trademarks of Bayerische Motoren Werke AG.  
This work is not affiliated with BMW AG in any way.
