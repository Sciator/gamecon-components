
```html
<div class="programNahled_obalProgramu">
  <div class="programPosuv_obal2">
    <div class="programPosuv_obal">
      <table class="program">
        <tbody>
          <tr>
            <th></th>
            <th>8:00</th>
            <th>9:00</th>
            ...
            <th>23:00</th>
          </tr>
          <tr>
            <!-- rowspan = Počet sloupců, vžy pouze první řádek dané linie obsahuje nazev -->
            <td rowspan="2">
              <div class="program_nazevLinie">Turnaje v deskovkách</div>
            </td>
            <!-- td vyplňují prázdná místa -->
            <td></td>
            ...
            <td></td>
            <!-- rowspan = Počet sloupců, vžy pouze první řádek dané linie obsahuje nazev -->
            <td colspan="8">
              <div class="vDalsiVlne"><a href="https://2021.gamecon.cz/turnaje#starnet-fotbal" target="_blank"
                  class="programNahled_odkaz" data-program-nahled-id="4028" title="Starnet fotbalový turnaj">Starnet
                  fotbalový turnaj</a><span class="program_obsazenost"> <span
                    class="neprihlasovatelna">(0/24)</span></span> </div>
            </td>
            <td></td>
              ...
            <td></td>
          </tr>
          ...
        </tbody>
      </table>
    </div>
    <div class="programPosuv_posuv programPosuv_lposuv" style="display: none;">
      <div></div>
    </div>
    <div class="programPosuv_posuv programPosuv_rposuv" style="display: block;">
      <div></div>
    </div>
  </div>
</div>
```